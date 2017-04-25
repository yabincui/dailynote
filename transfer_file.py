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

# This is to transfer file locally.

import cloudstorage as gcs
from google.appengine.api import app_identity
import time
import webapp2
import logging
import os

from template import load_template

class FileManager(object):
    @staticmethod
    def getBucketName():
        bucket_name = os.environ.get('BUCKET_NAME',
                               app_identity.get_default_gcs_bucket_name())
        return '/' + bucket_name
    
    @staticmethod
    def getFiles():
        stats = gcs.listbucket(FileManager.getBucketName() + '/')
        files = []
        for stat in stats:
            items = stat.filename.split('/')
            files.append(items[-1])
        return files

    @staticmethod    
    def writeFile(filename, content):
        filename = FileManager.getBucketName() + '/' +filename
        write_retry_params = gcs.RetryParams(backoff_factor=1.1)
        gcs_file = gcs.open(filename,
                      'w',
                      content_type='text/plain',
                      options={'x-goog-meta-foo': 'foo',
                               'x-goog-meta-bar': 'bar'},
                      retry_params=write_retry_params)
        gcs_file.write(content)
        gcs_file.close()
    
    @staticmethod
    def readFile(filename):
        filename = FileManager.getBucketName() + '/' +filename
        gcs_file = gcs.open(filename, 'r')
        content = gcs_file.read()
        gcs_file.close()
        return content

class TransferFilePage(webapp2.RequestHandler):
    def get(self):
        return self.redirect('transfer_file/download_file_form')

class UploadFilePage(webapp2.RequestHandler):
    def post(self):
        self.response.write('%s' % self.request.POST.multi['upload_file'])
        field = self.request.POST.multi['upload_file']
        filename = field.filename
        self.response.write('\n%s' % filename)
        content = field.file.read()
        FileManager.writeFile(filename, content)
        template_values = {
            'to_url' : 'download_file_form',
        }
        self.response.write(load_template('refresh_to_list_notes.html', template_values))
        #file_content = self.request.POST.multi['backup_file'].file.read()

class DownloadFileFormPage(webapp2.RequestHandler):
    def get(self):
        list = FileManager.getFiles()
        template_values = {
            'file_list' : list,
        }
        self.response.write(load_template('download_file.html', template_values))
        

class DownloadFilePage(webapp2.RequestHandler):
    def get(self):
        file_name = self.request.get('file')
        content = FileManager.readFile(file_name)
        self.response.headers['Content-Type'] = 'application/force-download'
        self.response.headers['Content-Disposition'] = 'attachment; filename=%s' % str(file_name)
        self.response.write(content)
