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
note_backup.py  backup data between updates of daily note.

"""

import datetime
import time
import webapp2
import json
import logging
import os
from pytz.gae import pytz

from google.appengine.ext import ndb

from login import user_required, get_user_email, get_user_id
from template import load_template
from note import NoteManager, Note

class BackupNotePage(webapp2.RequestHandler):
    @user_required
    def get(self):
        user_id = get_user_id()
        backup_all = True if self.request.get("backup_all") else False
        notes = NoteManager.getNotes(backup_all)
        self.response.headers['Content-Type'] = 'application/force-download'
        for note in notes:
            self.response.write('%s\n' % note.toString())
        
        
class RestoreNoteFormPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        backup_all = "?backup_all=true" if self.request.get("backup_all") else ""
        template_values = {
            'backup_all' : backup_all,
        }
        return self.response.write(load_template('restore_notes.html', template_values))


class RestoreNotePage(webapp2.RequestHandler):
    @user_required
    def post(self):
        file_content = self.request.POST.multi['backup_file'].file.read()
        items = file_content.split('\n')
        # map from old_note_id to new_note_id
        note_id_map = dict()
        notes = []
        for item in items:
            if not item:
                continue
            json_obj = json.loads(item)
            note_id = json_obj.get('note_id', '')
            note = NoteManager.getNote(note_id)
            if note:
                note_id_map[note_id] = note_id
            else:
                user_id = json_obj.get('user_id', '')
                priority = json_obj.get('priority', '')
                title = json_obj.get('title', '')
                task = json_obj.get('task', '')
                parent_note_id = json_obj.get('parent_note_id', '')
                tag = json_obj.get('tag', '')
                date_time = json_obj.get('date_time', '')
                date_time = datetime.datetime.strptime(date_time, '%Y-%m-%d %H:%M:%S.%f')
                state = json_obj.get('state', '')
                children_note_ids = json_obj.get('children_note_ids', '')
                note = NoteManager.createNote(user_id, priority, title, task,
                                              parent_note_id, tag, date_time, state,
                                              children_note_ids)
                note_id_map[note_id] = note.note_id
                notes.append(note)
        for note in notes:
            if note.parent_note_id:
                note.parent_note_id = note_id_map[note.parent_note_id]
            child_ids = note.getChildrenNoteIds()
            note.children_note_ids = ''
            for child_id in child_ids:
                note.addChildNote(note_id_map[child_id])
            NoteManager.updateNote(note)
        self.response.write(load_template('refresh_to_list_notes.html'))
