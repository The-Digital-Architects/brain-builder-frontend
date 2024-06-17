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
#from functools import partial
import json


cancel_vars = {}  # these will be used to cancel the process from consumers.py


# function to start subprocesses
def start_process(user_id, task_id, process_code:str, args=None, send_fn=None):  
    if type(args) == dict:
        block_info = find_module(args['block_id'])
        args += block_info
        args = json.dumps(args)  # convert the dictionary to a json string
    read_pipe, write_pipe = os.pipe()  # create a pipe to the subprocess

    # create a subprocess and log its output and errors to a custom pipe
    fname = 'backend/processing/' + find_file(process_code)
    fname = fname.split() + [args]
    #process = subprocess.Popen(['python'] + fname, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    process = subprocess.Popen(['python'] + fname, stdout=write_pipe, stderr=write_pipe)
    # IMPORTANT: by convention, assume fname can also contain two arguments: the first a specific function to be executed in the file and the second a dictionary containing the arguments for that function
    os.close(write_pipe)

    if send_fn is not None:
        # While the process is running, read updates from the pipe and send them over the WebSocket
        while process.poll() is None:
            # Check if the process was cancelled
            if cancel_vars.get((str(user_id), str(task_id))):
                process.terminate()
                print("Process cancelled")
                break

            while select.select([read_pipe], [], [], 0.1)[0]:
                output = os.read(read_pipe, 1024).decode()
                if output:
                    try:  # check if the output is in json format
                        update = json.loads(output)
                        send_fn(output)  # send the encoded output to the frontend
                    except json.JSONDecodeError:
                        output = dict(header='output', output=output)
                        output = json.dumps(output)
                        send_fn(output)
                        # # or alternatively
                        # print(output)
                else: 
                    break 
        
    os.close(read_pipe)

#     # create a thread to read the output and errors
#     if send_fn is not None:
#         thread = threading.Thread(target=partial(handle_output, send_fn), args=(process))
#         thread.start()
#         # process has started, report back to frontend


# def handle_output(send_fn): 
#     pass



# when the file is imported, read out the csv containing the process codes and store in a dataframe
f = 'process_codes.csv'
f = os.path.join(os.path.dirname(__file__), f)
codes = pd.read_csv(f, sep=';')

# function to process process codes
def find_file(process_code:str):
    if process_code in codes['code'].values:
        return codes.loc[codes['code'] == process_code, 'file'].values[0]

    else: 
        raise ValueError("Invalid process code")
        # TODO: check error handling


# when the file is imported, read out the block database and store in a dataframe
blocks = None  # TODO: find a way to import the block database

def find_module(block_id:int):  # TODO: test this
    if block_id in blocks['task_id'].values:
        # convert the block's row into a dictionary
        return blocks.loc[blocks['task_id'] == block_id].to_dict(orient='records')[0]





if __name__ == '__main__':
    code = input("Try a process code: ")
    start_process(code, 'yako', send_fn=print)







# ______________________________________________________________________________________________________________________
# ORIGINAL CODE

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

