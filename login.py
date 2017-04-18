import time
import webapp2
import logging
import os

from google.appengine.ext import ndb
from google.appengine.api import users

import jinja2

class LoginPage(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            nickname = user.nickname()
            logout_url = users.create_logout_url('/')
            greeting = 'Welcome {}! (<a href="{}">Log out</a>)'.format(
                nickname, logout_url)
        else:
            login_url = users.create_login_url('/login')
            greeting = '<a href="{}">Sign in</a>'.format(
                login_url)
        self.response.write(
            '<html><body>{}</body></html>'.format(greeting))

def user_required(handler):
    """
    Decorator that checks if there's a user associated with the current session.
    Will also fail if there's no session present.
    """
    def check_login(self, *args, **kwargs):
        user = users.get_current_user()
        if user:
            return handler(self, *args, **kwargs)
        else:
            login_url = users.create_login_url()
            return self.redirect(login_url)

    return check_login

def get_user():
    return users.get_current_user()

def get_user_email():
    return get_user().email()

def get_user_id():
    return get_user().user_id()

def is_admin():
    return get_user_email() == 'splintcoder@gmail.com'

class AfterLoginPage(webapp2.RequestHandler):
    @user_required
    def get(self):
        self.response.write('<html><body>Hello {}</body></html>'.format(
            users.get_current_user().email()))