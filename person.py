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

class Person(ndb.Model):
    name = ndb.StringProperty()
    age = ndb.IntegerProperty()
    email = ndb.StringProperty()

class AddPersonFormPage(webapp2.RequestHandler):
    def get(self):
        s = ''
        for person in Person.query().fetch():
            s += 'name %s, age %d, email %s<br>\n' % (
                                person.name, person.age, person.email)
    
        self.response.write("""
    <html>
        <body>
            %s
            <form action="/add_person">
                Name:<br>
                <input type="text" name="name"> <br>
                Age:<br>
                <input type="text" name="age"> <br>
                Email:<br>
                <input type="text" name="email"> <br>
                <input type="submit" value="Submit">
            </form>
        </body>
    </html>
    """ % s)

class AddPersonPage(webapp2.RequestHandler):
    def get(self):
        name = self.request.GET['name']
        age = int(self.request.GET['age'])
        email = self.request.GET['email']
        person = Person(name=name, age=age, email=email)
        person.put()
        return webapp2.redirect('/add_person_form')

    
class ListPersonPage(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write("<html><body>")
        for person in Person.query().fetch():
            self.response.write('name %s, age %d, email %s<br>\n' % (
                                person.name, person.age, person.email))
        self.response.write('<a href="/add_person_form">Add a person</a>')
        self.response.write("</body></html>")
        
            