"""
This file contains some useful  functions to communicate with the frontend.
These functions can be implemented in the backend/processing files. 
Current version only includes send_print.  
send_error and send_plot will be added in the future. 
Work in progress. 
"""

# TODOs:
# ...


# imports: 
import json


def send_print(message, send_fn):
    """
    Function that sends a print statement to the frontend. 
    Needs a message to send and the send_fn corresponding to the websocket connection. 
    """
    message = {'header': 'print', 'message': message}
    send_fn(json.dumps(message))
