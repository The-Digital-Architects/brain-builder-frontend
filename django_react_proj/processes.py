"""
This file links the process codes to the actual backend processes. 
It will be used by process_http_request.py and consumers.py to respond to http requests and websocket inputs respectively. 
Work in progress. 
"""
# TODOs:
# - find a way to import the block database
# - check and rework the original code
# - check imports
# - find a way to handle errors internally and discplay a message to the user
# - complete the docstring


# imports 
import os
if __name__ == '__main__':
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
import pandas as pd
import subprocess
import select
import inspect
#from functools import partial
import json
from django.forms.models import model_to_dict
from backend.processing import communication


# function to start subprocesses
def run(file_name, function_name, args=None):  
    magic_box = {'required_parameters': None, 'inspect': inspect, 'fn': None}
    #fl, fn = find_file(process_code)  # find the file and function corresponding to the process code
    
    # import the function from the file
    file_name = 'backend.processing.' + file_name
    try:
        exec(f'from {file_name} import {function_name}', magic_box)
    except Exception as e:
        print(e)  # TODO: add error handling

    # get the required parameters of the function
    exec(f'required_parameters = list(inspect.signature({function_name}).parameters.keys())', magic_box)
    required_parameters = magic_box['required_parameters']

    # unpack the inputs
    execution_string = function_name + '('
    for p in required_parameters:
        #if p != 'send_fn':
            execution_string += p + '='
            try:
                if type(args[p]) == str:
                    execution_string += f"'{args[p]}'"
                else:
                    execution_string += f'{args[p]}'
            except Exception as e:
                print(e)  # TODO: add error handling
            execution_string += ','
    #execution_string += f'send_fn=send_fn'
    execution_string += ')'

    # execute the function
    print('Executing: ', execution_string)
    exec(execution_string, magic_box)
    

'''
# when the file is imported, read out the csv containing the process codes and store in a dataframe
f = 'process_codes.csv'
f = os.path.join(os.path.dirname(__file__), f)
codes = pd.read_csv(f, sep=';')

# function to process process codes
def find_file(process_code:str):
    if process_code in codes['code'].values:
        return (codes.loc[codes['code'] == process_code, 'file'].values[0], 
                codes.loc[codes['code'] == process_code, 'function'].values[0])

    else: 
        raise ValueError("Invalid process code")
        # TODO: check error handling



def find_module(block_id:int):  # TODO: test this
    from backend.databases.models import TaskDescription
    try:
        block = TaskDescription.objects.get(task_id=block_id)
        return model_to_dict(block)
    except TaskDescription.DoesNotExist:
        block = None
        raise KeyError("Block not found")
    
    # if block_id in blocks['task_id'].values:
    #     # convert the block's row into a dictionary
    #     return blocks.loc[blocks['task_id'] == block_id].to_dict(orient='records')[0]
'''


# Generated with GH Copilot
# Warning: this is vulnerable to Code Injection Attacks!
# Cannot handle plots yet
async def execute_code(code:str, user_id, notebook_id, send_fn):
    if is_suspicious(code):
        output = {'header': 'error', 'output': 'Code execution was blocked due to suspicious code'}
        send_fn(json.dumps(output))
        return

    # Write the code to a temporary Python file
    with open('/tmp/code.py', 'w') as f:
        f.write(code)

    read_pipe, write_pipe = os.pipe()  # create a pipe to the subprocess

    # Run the Python file in a subprocess
    process = subprocess.Popen(['python', '/tmp/code.py'], stdout=write_pipe, stderr=write_pipe)
    os.close(write_pipe)


    if send_fn is not None:
        # While the process is running, read updates from the pipe and send them over the WebSocket
        while process.poll() is None:
            # Check if the process was cancelled
            if communication.cancel_vars.get((str(user_id), str(notebook_id))):
                process.terminate()
                print("Process cancelled")
                break

            while select.select([read_pipe], [], [], 0.1)[0]:
                output = os.read(read_pipe, 1024).decode()
                if output:
                    try:  # check if the output is in json format
                        _ = json.loads(output)
                        print("Sending json output")
                        if inspect.iscoroutinefunction(send_fn):
                            await send_fn(output)  # send the encoded output to the frontend
                        else: 
                            send_fn(output)  # send the encoded output to the frontend
                    except json.JSONDecodeError:
                        output = dict(header='output', notebook_id=notebook_id, output=output)
                        output = json.dumps(output)
                        print("Sending print: ", output)
                        if inspect.iscoroutinefunction(send_fn):
                            await send_fn(output)
                        else: 
                            send_fn(output)
                        # # or alternatively
                        # print(output)
                else: 
                    break 
        
    os.close(read_pipe)
    os.remove('/tmp/code.py')  # Delete the temporary Python file
    print('Code executed')


# TODO: Warning: this is a very basic safety function, needs to be improved!
def is_suspicious(code):
    # Check #1: length of the code: 
    max_char = 2000
    max_lines = 50
    if len(code) > max_char or code.count('\n') > max_lines:
        print("Wrong")
        return True

    # Check #2: suspicious words 
    code += ' '  # add a space at the end to avoid index errors
    suspicious_letters = ["getattr", "import", "subprocess", "exec", "eval", "open", "write", "unlink", "rmdir", "remove", "compile", "globals", "locals"]
    suspicious_words = ["os", "sys", "input"]

    for x in suspicious_letters:
        if x in code:
            print('Wrong')
            return True
        
    for x in suspicious_words:
        start = 0
        while start < len(code):
            try:
                # find the index of x in code starting from 'start'
                idx = start + code[start::].index(x)
                print(idx)
                # check the characters around it
                if code[idx-1] in ['"', "'", " ", "\n", ".", "(", ")"] and code[idx+len(x)] in ['"', "'", " ", "\n", ".", "(", ")"]:
                    return True
                # move 'start' to next character after current 'x'
                start = idx + 1
            except ValueError:
                # no more occurrences of 'x' in 'code'
                break

    return False


if __name__ == '__main__':
    def custom_print(sometext, wait=False): print(sometext)
    user_id = 'laurens'
    task_id = 11
    communication.send_fn_vars[user_id, str(task_id)] = custom_print
    run(file_name='plotting', function_name='ManualLinReg', args={
        'a': 1,
        'b': 0,
        'task_id': task_id,
        'user_id': user_id
    })




# ______________________________________________________________________________________________________________________
# ORIGINAL FILE

# This module contains the information on the different levels and challenges used in the backend.
# It is called by the process_data module,
# and calls the data_functions module to get the actual data.
# The game data is stored in a csv file, which is loaded into a pandas dataframe.
# There are 3 ways to obtain a dataset:
# 1. load a dataset from sklearn (e.g. 'load_wine()', 'load_iris()', 'load_digits')
# 2. load a dataset from an Excel file (e.g. 'Clas1', 'Clas2a', 'Reg1')
# 3. use a custom dataset class (e.g. 'sin' or 'circle')

# Improvements:
# Idea: look into 'make_classification', 'make_regression' and 'make_blobs' from sklearn.datasets
# Idea: add an 'image' option to load an image dataset from a folder
# Idea: add a 'custom' option to load a custom dataset from a csv (and potentially expand this to images?)
# Idea: look into reinforcement learning

