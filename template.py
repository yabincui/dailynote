import time
import webapp2
import logging
import os

from google.appengine.ext import ndb

import jinja2
from jinja2.exceptions import TemplateNotFound

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__))),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def get_javascript_path():
    file = 'main.js'
    return '/static/js/' + file

def load_template(filename, template_values = None):
    if not template_values:
        template_values = {}
    template_values['js_path'] = get_javascript_path()
    file_in_template = os.path.join(os.path.dirname(__file__),
                                    'templates', filename)
    if os.path.isfile(file_in_template):
        filename = os.path.join('templates', filename)
    template = JINJA_ENVIRONMENT.get_template(filename)
    return template.render(template_values).encode('utf-8')

class TemplatePage(webapp2.RequestHandler):
    def get(self):
        template_values = {
            'user': 'Yabin',
        }
        template = JINJA_ENVIRONMENT.get_template('template.html')
        self.response.write(template.render(template_values))
