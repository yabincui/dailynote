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
import json
import logging
import os
import time
import webapp2
from pytz.gae import pytz

from google.appengine.ext import ndb

from login import user_required, get_user_email, get_user_id, is_admin
from template import load_template

class Note(ndb.Model):
    note_id = ndb.StringProperty()
    user_id = ndb.StringProperty()
    date_time = ndb.DateTimeProperty()
    state = ndb.StringProperty()
    priority = ndb.StringProperty()
    title = ndb.StringProperty()
    task = ndb.TextProperty()
    parent_note_id = ndb.StringProperty()
    tag = ndb.StringProperty()
    children_note_ids = ndb.StringProperty()

    def addChildNote(self, child_note):
        if self.children_note_ids:
            self.children_note_ids += ':' + child_note.note_id
        else:
            self.children_note_ids = child_note.note_id

    def removeChildNote(self, child_note):
        children = self.children_note_ids.split(':')
        children.remove(child_note.note_id)
        if children:
            self.children_note_ids = ':'.join(children)
        else:
            self.children_note_ids = ''

    def getChildrenNoteIds(self):
        if not self.children_note_ids:
            return []
        children = self.children_note_ids.split(':')
        return children
    
    def getTags(self):
        tags = ['ALL']
        if self.tag:
            for i in self.tag.split(','):
                tags.append(i.strip())
        return tags


    def toString(self):
        return json.dumps({
                'note_id' : self.note_id,
                'user_id' : self.user_id,
                'date_time' : str(self.date_time),
                'state' : self.state,
                'priority' : self.priority,
                'title' : self.title,
                'task' : self.task,
                'parent_note_id' : self.parent_note_id,
                'tag' : self.tag,
                'children_note_ids' : self.children_note_ids,
            })


class NoteManager(object):
    @staticmethod
    def createNote(user_id, priority, title, task, parent_note_id, tag,
                   date_time = datetime.datetime.utcnow(),
                   state = 'TODO', children_note_ids = ''):
        """Create a new Note, return the created note."""
        note = Note(user_id=user_id, date_time=date_time,
                    state=state, priority=priority,
                    title=title, task=task,
                    parent_note_id=parent_note_id,
                    tag=tag,
                    children_note_ids=children_note_ids)
        note_key = note.put()
        note = note_key.get()
        note.note_id = note_key.urlsafe()
        note.put()
        if parent_note_id:
            parent_note = NoteManager.getNote(parent_note_id)
            parent_note.addChildNote(note)
            parent_note.put()
        return note

    @staticmethod
    def getNote(note_id):
        note_key = ndb.Key(urlsafe=note_id)
        note = note_key.get()
        return note

    @staticmethod
    def getParent(note):
        if not note.parent_note_id:
            return None
        return NoteManager.getNote(note.parent_note_id)

    @staticmethod
    def getChildren(note):
        children_ids = note.getChildrenNoteIds()
        children = []
        for child in children_ids:
            children.append(NoteManager.getNote(child))
        return children

    @staticmethod
    def getNotes(backup_all=False):
        """Return all notes in a list."""
        user_id = get_user_id()
        if backup_all and get_user_email() == 'splintcoder@gmail.com':
            notes = Note.query().fetch()
        else:
            notes = Note.query(Note.user_id == user_id).fetch()
        # Update note.children_parent_ids to update notes created before adding this field.
        for note in notes:
            parent = NoteManager.getParent(note)
            if parent:
                children_ids = parent.getChildrenNoteIds()
                if not note.note_id in children_ids:
                    parent.addChildNote(note)
                    parent.put()

        # Sort notes based on state, priority and timestamp.
        def comp(a, b):
            if a.state.upper() != b.state.upper():
                return -1 if a.state.upper() == 'TODO' else 1
            elif a.priority.upper() != b.priority.upper():
                return -1 if a.priority.upper() < b.priority.upper() else 1
            elif a.date_time != b.date_time:
                return -1 if a.date_time > b.date_time else 1
            return 0
        notes.sort(cmp=comp)
        return notes

    @staticmethod
    def updateNote(note):
        note.put()

    @staticmethod
    def removeNote(note):
        """Remove a note and all its children notes."""
        parent = NoteManager.getParent(note)
        if parent:
            parent.removeChildNote(note)
            parent.put()
        children = NoteManager.getChildren(note)
        for child in children:
            NoteManager.removeNote(child)
        note_key = ndb.Key(urlsafe=note.note_id)
        note_key.delete()
        pass


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
        priority = self.request.get("priority", "p4")
        title = self.request.get("title")
        task = self.request.get("task")
        tag = self.request.get("tag")
        parent_note_id = self.request.get("parent_note_id")
        logging.debug('Add Note Page, parent_note_id = %s' % parent_note_id)
        note = NoteManager.createNote(user_id, priority, title, task, parent_note_id, tag)
        return self.redirect('dump_note?note_id=%s' % str(note.note_id))

def formatTime(date_time):
    a = date_time.replace(tzinfo=pytz.utc).astimezone(pytz.timezone('America/Los_Angeles'))
    return a.strftime("%y-%m-%d %H:%M:%S")

class DumpNotePage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        return self.redirect('change_note_form?note_id=%s' % str(note_id))

# class ListNotesPage_Old(webapp2.RequestHandler):
#     @user_required
#     def get(self):
#         need_tag = self.request.get('tag', 'ALL')
#         note_values = []
#         tag_values = set()
#         for note in NoteManager.getNotes():
#             tag_values.add(note.tag if note.tag else 'DEFAULT')
#             if need_tag != 'ALL':
#                 if need_tag == 'DEFAULT' and not note.tag:
#                     pass
#                 elif need_tag != note.tag:
#                     continue
#             value = {}
#             value['note_id'] = str(note.note_id)
#             value['user_id'] = note.user_id
#             value['user_email'] = get_user_email()
#             value['date_time'] = formatTime(note.date_time)
#             value['state'] = note.state
#             value['priority'] = note.priority
#             value['title'] = note.title
#             value['task'] = note.task
#             value['tag'] = note.tag
#             value['parent'] = NoteManager.getParent(note)
#             value['children'] = NoteManager.getChildren(note)
#             note_values.append(value)
#         template_values = {
#             'is_admin' : is_admin(),
#             'tag_values' : tag_values,
#             'note_values' : note_values,
#             'need_tag' : need_tag,
#         }
#         self.response.write(load_template('list_notes.html', template_values))


class ListNotesPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        need_tag = self.request.get('tag', 'ALL')
        tag_values = set()
        tag_values.add('ALL')
        for note in NoteManager.getNotes():
            for tag in note.getTags():
                tag_values.add(tag)
        template_values = {
            'is_admin' : is_admin(),
            'tag_values' : tag_values,
            'need_tag' : need_tag,
        }
        self.response.write(load_template('list_notes2.html', template_values))

class ChangeNoteFormPage_Old(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note = NoteManager.getNote(note_id)
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
            'tag' : note.tag,
        }
        logging.info("priority is %s" % note.priority)
        self.response.write(load_template('change_note.html', template_values))


class ChangeNoteFormPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note = NoteManager.getNote(note_id)
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        template_values = {
            'note_id' : str(note.note_id),
        }
        logging.info("priority is %s" % note.priority)
        self.response.write(load_template('change_note2.html', template_values))


class ChangeNotePage(webapp2.RequestHandler):
    @user_required
    def post(self):
        note_id = self.request.get('note_id')
        logging.info('changeNote: note_id = %s' % note_id)
        note = NoteManager.getNote(note_id)
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        note.title = self.request.get('title')
        note.task = self.request.get('task')
        note.state = self.request.get('state')
        note.priority = self.request.get('priority')
        note.tag = self.request.get('tag')
        NoteManager.updateNote(note)
        self.response.write('ok')

class DeleteNotePage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note = NoteManager.getNote(note_id)
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        NoteManager.removeNote(note)
        template_values = {
            'to_url' : 'list_notes',
        }
        self.response.write(load_template('refresh_to_list_notes.html', template_values))


class GetNotePage(webapp2.RequestHandler):
    @user_required
    def get(self):
        note_id = self.request.get('note_id')
        note = NoteManager.getNote(note_id)
        if note.user_id != get_user_id():
            self.response.write("note doesn't belong to current user!")
            return
        parent = NoteManager.getParent(note)
        children = NoteManager.getChildren(note)
        
        parent_info = {}
        if parent:
            parent_info = {
                'note_id' : parent.note_id,
                'title' : parent.title,
            }
        children_info = []
        for child in children:
            children_info.append({
                    'note_id': child.note_id,
                    'title' : child.title,
                })

        json_str = json.dumps({
            'note_id' : note.note_id,
            'user_id' : note.user_id,
            'date_time' : str(note.date_time),
            'state' : note.state,
            'priority' : note.priority,
            'title' : note.title,
            'task' : note.task,
            'tag' : note.tag,
            'parent' : parent_info,
            'children' : children_info,
            })

        self.response.write(json_str)


class GetNoteIdsPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        need_tag = self.request.get('tag', 'ALL')
        note_ids = []
        for note in NoteManager.getNotes():
            for tag in note.getTags():
                if need_tag == tag:
                    note_ids.append(note.note_id)
                    break
        json_str = json.dumps({
            'note_ids': note_ids,
            })
        self.response.write(json_str)

