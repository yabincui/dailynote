import time
import webapp2
import logging
import os

from template import load_template

class ReactPage(webapp2.RequestHandler):
    def get(self):
        self.response.write(load_template('frontend-app/build/index.html'))