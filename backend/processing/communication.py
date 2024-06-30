"""
This file contains some useful  functions to communicate with the frontend.
These functions can be implemented in the backend/processing files. 
Current version includes send_print, send_error and send_plot.  
"""

# TODOs:
# look into error handling


# imports: 
import json
from base64 import b64encode


cancel_vars = {}  # these will be used to cancel the process from consumers.py


def send_print(message, send_fn):
    """
    Function that sends a print statement to the frontend. 
    Needs a message to send and the send_fn corresponding to the websocket connection. 
    """
    message = {'header': 'print', 'message': message}
    send_fn(json.dumps(message))


def send_error(error, send_fn, code=None):
    """
    Function that sends an error message to the frontend.
    Needs an error message to send and the send_fn corresponding to the websocket connection. 
    """
    message = {'header': 'error', 'error': error}
    if code: message['error_code'] = code
    send_fn(json.dumps(message))


def send_plot(img, send_fn, description=None):
    """
    Function that sends a plot to the frontend.
    ...
    """
    b64encode(img).decode()  # base64 encoded image, showing pyplot of the data
