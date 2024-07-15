"""
This file contains some useful  functions to communicate with the frontend.
These functions can be implemented in the backend/processing files. 
Current version includes send_print, send_error, send_plot and send_update. The latter is more flexible and can send more variables.
There is also is_cancelled, which checks whether the process has been cancelled by the frontend. Check this if your process has a cancel button in the frontend. 

## A rough guide on how to set up your own backend process:
1. Create a new file in backend/processing/ with the name of your process.
2. Import the necessary libraries: currently matplotlib, pandas, numpy, torch and sklearn are available. 
Also import the necessary communication functions from this file (see above).
3. Write a main function you want to call from the frontend. Write this as a regular python function. Write the rest of your code as usual. 
In your code, use print() to log messages to the backend console, and use the communication functions in this file to send messages/updates/images to the frontend. 
If your process is expected to take long (> 10 seconds) or includes a cancel function in the frontend, you should periodically check the cancel_vars using is_cancelled.
4. Update the databases to include the necessary information for your process.
5. Make sure the frontend correctly handles your updates, and debug if necessary. 

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
    result = cancel_vars.get((str(user_id), str(task_id)), False)
    if result: print("Secondary thread cancelled")
    return result


def send_update(var_names, vars, task_id, user_id, header=None):
    """
    Function that sends an update to the frontend. 
    Needs a list of variables to send, the variables inside the function scope (add ) and the user_id and task_id corresponding to the websocket connection. 
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
    
    if not cancel_vars.get((str(user_id), str(task_id)), False):
        send_fn_vars[(str(user_id), str(task_id))](message, wait=True)


def send_print(message, task_id, user_id):
    """
    Function that sends a print statement to the frontend. 
    Needs a message to send and the user_id and task_id corresponding to the websocket connection. 
    """
    message = {'header': 'print', 'message': message}

    if not cancel_vars.get((str(user_id), str(task_id)), False):
        send_fn_vars[(str(user_id), str(task_id))](message, wait=True)


def send_error(error, task_id, user_id, code=None):
    """
    Function that sends an error message to the frontend.
    Needs an error message to send and the user_id and task_id corresponding to the websocket connection. 
    """
    message = {'header': 'error', 'error': error}
    if code: message['error_code'] = code

    if not cancel_vars.get((str(user_id), str(task_id)), False):
        send_fn_vars[(str(user_id), str(task_id))](message, wait=True)


def send_image(img, task_id, user_id, description=None):  # TODO
    """
    Function that sends a plot to the frontend.
    Needs an BytesIO image to send and the user_id and task_id corresponding to the websocket connection. 
    Example use for a matplotlib figure:
        ```
        img = BytesIO()
        fig.savefig(img, format='png')
        img.seek(0)
        self.images.append(img.getvalue())
        ```
    Image is base64 encoded before sending.
    """
    b64encode(img).decode()  # base64 encoded image
    message = {'header': 'image', 'img': img, 'description': description}

    if not cancel_vars.get((str(user_id), str(task_id)), False):
        send_fn_vars[(str(user_id), str(task_id))](message, wait=True)
