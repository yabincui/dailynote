# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
note.py  use datastore to store daily note.
    Store daily notes (user, date, time, state, priority, title,
                       text, parent)
    Get daily notes in different views
        Each user can only see its own daily note.
        View notes today, or in one week, in one month.
        View unfinished notes.
        View notes in tree graph.
        View leaf unfinished notes.
    Modify daily notes.
        Daily note states are (TODO, DEPEND_ON_OTHERS, DONE, DEPRECATED)
        Priority can be changed (from P1 to P4)
        The text can only be appended, can't be removed.

"""

import datetime
import time
import webapp2
import logging
import os
from pytz.gae import pytz

from google.appengine.ext import ndb

from login import user_required, get_user_email, get_user_id
from template import load_template

class Note(ndb.Model):
    note_id = ndb.StringProperty()
    user_id = ndb.StringProperty()
    date_time = ndb.DateTimeProperty()
    state = ndb.StringProperty()
    priority = ndb.StringProperty()
    title = ndb.StringProperty()
    task = ndb.StringProperty()
    parent_note_id = ndb.StringProperty()


class AddNoteFormPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        parent_note_id = self.request.get('parent_note_id', '')
        template_values = {
            'parent_note_id' : parent_note_id,
        }
        return self.response.write(load_template('add_note.html',
                                                 template_values))

class AddNotePage(webapp2.RequestHandler):
    @user_required
    def post(self):
        user_id = get_user_id()
        date_time = datetime.datetime.utcnow()
        state = "TODO"
        priority = self.request.get("priority", "p4")
        title = self.request.get("title")
        task = self.request.get("task")
        parent_note_id = self.request.get("parent_note_id")
        logging.debug('Add Note Page, parent_note_id = %s' % parent_note_id)

        note = Note(user_id=user_id, date_time=date_time,
                    state=state, priority=priority,
                    title=title, task=task,
                    parent_note_id=parent_note_id)
        note_key = note.put()
        note = note_key.get()
        note.note_id = note_key.urlsafe()
        note.put()
        logging.info("type(note.note_id) = %s", note.note_id)
        return self.redirect('dump_note?note_id=%s' % str(note.note_id))

def formatTime(date_time):
    a = date_time.replace(tzinfo=pytz.utc).astimezone(pytz.timezone('America/Los_Angeles'))
    return a.strftime("%y-%m-%d %H:%M:%S")

class DumpNotePage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note_key = ndb.Key(urlsafe=note_id)
        note = note_key.get()
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        template_values = {
            'note_id' : str(note.note_id),
            'user_id' : note.user_id,
            'user_email' : get_user_email(),
            'date_time' : formatTime(note.date_time),
            'state' : note.state,
            'priority' : note.priority,
            'title' : note.title,
            'task' : note.task,
        }
        logging.debug('Dump Note Page, parent_note_id = %s' % note.parent_note_id)
        if note.parent_note_id:
            note_key = ndb.Key(urlsafe=note.parent_note_id)
            parent_note = note_key.get()
            template_values['parent'] = parent_note
        else:
            template_values['parent'] = None
        self.response.write(load_template('dump_note.html', template_values))

class ListNotesPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        user_id = get_user_id()
        notes = Note.query(Note.user_id == user_id).fetch()
        note_values = []
        for note in notes:
            value = {}
            value['note_id'] = str(note.note_id)
            value['user_id'] = note.user_id
            value['user_email'] = get_user_email()
            value['date_time'] = formatTime(note.date_time)
            value['state'] = note.state
            value['priority'] = note.priority
            value['title'] = note.title
            value['task'] = note.task
            if note.parent_note_id:
                note_key = ndb.Key(urlsafe=note.parent_note_id)
                parent_note = note_key.get()
                value['parent'] = parent_note
            else:
                value['parent'] = None
            note_values.append(value)
        template_values = {
            'note_values' : note_values,
        }
        self.response.write(load_template('list_notes.html', template_values))

class ChangeNoteFormPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note_key = ndb.Key(urlsafe=note_id)
        note = note_key.get()
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        template_values = {
            'note_id' : str(note.note_id),
            'user_id' : note.user_id,
            'user_email' : get_user_email(),
            'date_time' : str(note.date_time),
            'state' : note.state,
            'priority' : note.priority,
            'title' : note.title,
            'task' : note.task,
        }
        logging.info("priority is %s" % note.priority)
        self.response.write(load_template('change_note.html', template_values))

class ChangeNotePage(webapp2.RequestHandler):
    @user_required
    def post(self):
        note_id = self.request.get('note_id')
        note_key = ndb.Key(urlsafe=note_id)
        note = note_key.get()
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        note.title = self.request.get('title', note.title)
        note.task = self.request.get('task', note.task)
        note.state = self.request.get('state', note.state)
        note.priority = self.request.get('priority', note.priority)
        note.put()
        return self.redirect('dump_note?note_id=%s' % str(note.note_id))

class DeleteNotePage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note_key = ndb.Key(urlsafe=note_id)
        note = note_key.get()
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        note_key.delete()
        self.response.write(load_template('delete_note.html'))
