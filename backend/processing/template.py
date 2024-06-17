# definitely import these: 
import sys
import json
...

# other functions here


def some_function(args):
    """
    This function can be executed by typing 'python template some_function args' in the terminal. 
    Args must be a json-encoded dictionary containing the following keys: 
    'user_id', 'block_id', 'dataset', 'n_inputs', 'n_outputs', 'normalization', ...
    """
    # decode the json args
    args = json.loads(args)
    print("You can access the arguments like this: user_id = ", args['user_id'])  # COMMENT OUT

    ...
    a = 1
    b = 2
    c = 3

    send_data(['a', 'b', 'c'], (a, b, c))


def main():
    print("This function is executed if no arguments are provided")  # COMMENT OUT


def send_data(names, values):
    """
    This function sends data to the frontend by collecting the variables in a dictionary and encoding as a json string. 
    It uses a header 'update'. 
    - names should be a list of strings representing the names of the variables; 
    - values should contain the variables (in the right order). 
    Can be directly imported in your module in backend/processing. 
    """
    data = dict(zip(names, values))  # this creates a dictionary with the names as keys and the values as values
    data['header'] = 'update'  # a message telling the frontend what contents to expect
    
    data = json.dumps(data)  # this converts the data variable to a string
    print(data)  # the output is captured by the middleware, which will recognize the json string and send it to the frontend


if __name__ == '__main__':
    # extensive code: 
    if len(sys.argv) == 1:
        # just run the main code
        main()
    
    elif len(sys.argv) == 3:
        # run the function given by argv[1]
        if sys.argv[1] in globals():
            globals()[sys.argv[1]](sys.argv[2])
        else:
            raise ValueError("Function not found")
            # TODO: look into error handling
            sys.exit(1)
    
    else:
        raise ValueError("Use either no or two arguments")
        # TODO: look into error handling
        sys.exit(1)
