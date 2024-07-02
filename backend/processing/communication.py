"""
This file contains some useful  functions to communicate with the frontend.
These functions can be implemented in the backend/processing files. 
Current version includes send_print, send_error, send_plot and send_update. The latter is more flexible and can send more variables.
There is also is_cancelled, which checks whether the process has been cancelled by the frontend. 
"""

# TODOs:
# look into error handling


# imports: 
from base64 import b64encode

#loop_vars = {}  # these will be used to send messages to the frontend
send_fn_vars = {}  # these will be used to send messages to the frontend
#message_vars = {}  # these will be used to send messages to the frontend
cancel_vars = {}  # these will be used to cancel the process from consumers.py

def is_cancelled(user_id, task_id):
    """
    Function that checks if the process has been cancelled by the frontend. 
    If your process is expected to take long (> 10 seconds), you should periodically check this.
    """
    return cancel_vars.get((str(user_id), str(task_id)), False)


def send_update(var_names, vars, task_id, user_id, header=None):
    """
    Function that sends an update to the frontend. 
    Needs a list of variables to send, the variables inside the function scope (add ) and the send_fn corresponding to the websocket connection. 
    Optionally, a custom header can be added.
    """
    message = {'header': header if header else 'update'}
    if type(vars) == list or tuple:
        for i, var in enumerate(var_names):
            message[var] = vars[i]
    elif type(vars) == dict: 
        for var in var_names:
            message[var] = vars[var]
    else: 
        send_error(error="TypeError in communication.py: variables should be a list or a dictionary", user_id=user_id, task_id=task_id)
        return
    
    send_fn_vars[(str(user_id), str(task_id))](message)


def send_print(message, task_id, user_id):
    """
    Function that sends a print statement to the frontend. 
    Needs a message to send and the send_fn corresponding to the websocket connection. 
    """
    message = {'header': 'print', 'message': message}

    send_fn_vars[(str(user_id), str(task_id))](message)


def send_error(error, task_id, user_id, code=None):
    """
    Function that sends an error message to the frontend.
    Needs an error message to send and the send_fn corresponding to the websocket connection. 
    """
    message = {'header': 'error', 'error': error}
    if code: message['error_code'] = code

    send_fn_vars[(str(user_id), str(task_id))](message)


def send_plot(img, task_id, user_id, description=None):
    """
    Function that sends a plot to the frontend.
    ...
    """
    b64encode(img).decode()  # base64 encoded image
    message = {'header': 'image', 'img': img, 'description': description}

    send_fn_vars[(str(user_id), str(task_id))](message)
