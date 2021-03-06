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

import time
import webapp2
import logging
import os

from google.appengine.ext import ndb

from person import AddPersonFormPage, AddPersonPage, ListPersonPage
from template import TemplatePage, load_template
from login import LoginPage, AfterLoginPage
from note import AddNoteFormPage, AddNotePage, DumpNotePage, \
    ListNotesPage, ChangeNoteFormPage, ChangeNotePage, \
    DeleteNotePage, GetNotePage, GetNoteIdsPage
from note_backup import BackupNotePage, RestoreNoteFormPage, RestoreNotePage
from transfer_file import TransferFilePage, UploadFilePage, \
    DownloadFileFormPage, DownloadFilePage
from react import ReactPage

class MainPage(webapp2.RequestHandler):
    def get(self):
        #self.response.write(load_template('main.html'))
        return self.redirect("/list_notes")


class TimeoutPage(webapp2.RequestHandler):
    def get(self):
        from google.appengine.runtime import DeadlineExceededError
        try:
            time.sleep(70)
            self.response.write('Completed.')
        except DeadlineExceededError:
            self.response.clear()
            self.response.set_status(500)
            self.response.out.write('The request did not complete in time.')

class LogPage(webapp2.RequestHandler):
    def get(self):
        logging.debug('This is a debug message')
        logging.info('This is an info message')
        logging.warning('This is a warning message')
        logging.error('This is an error message')
        logging.critical('This is a critical message')

        try:
            raise ValueError('This is a sample value error.')
        except ValueError:
            logging.exception('An example exception log.')

        self.response.out.write('Logging example.')

class EnvPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain'
        for key, value in os.environ.iteritems():
            self.response.out.write('{} = {}\n'.format(key, value))


app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/timeout', TimeoutPage),
    ('/log', LogPage),
    ('/env', EnvPage),
    ('/list_person', ListPersonPage),
    ('/add_person_form', AddPersonFormPage),
    ('/add_person', AddPersonPage),
    ('/template', TemplatePage),
    ('/login', LoginPage),
    ('/after_login', AfterLoginPage),
    ('/add_note_form', AddNoteFormPage),
    ('/add_note', AddNotePage),
    ('/dump_note', DumpNotePage),
    ('/list_notes', ListNotesPage),
    ('/change_note_form', ChangeNoteFormPage),
    ('/change_note', ChangeNotePage),
    ('/delete_note', DeleteNotePage),
    ('/backup_note', BackupNotePage),
    ('/restore_note_form', RestoreNoteFormPage),
    ('/restore_note', RestoreNotePage),
    ('/get_note', GetNotePage),
    ('/get_note_ids', GetNoteIdsPage),
    ('/transfer_file', TransferFilePage),
    ('/transfer_file/upload_file', UploadFilePage),
    ('/transfer_file/download_file_form', DownloadFileFormPage),
    ('/transfer_file/download_file', DownloadFilePage),
    ('/react', ReactPage),
], debug=True)
