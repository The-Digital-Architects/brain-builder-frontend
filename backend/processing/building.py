# TODOs: 
# - test this module
# - add docstrings
# - potentially rework the training code

"""
This module contains the functions used to build the neural network.
It is called by the process_data module,
and calls the levels module for information on the games, and the modular_network module for the actual network.
"""

# Improvements:
# Idea: look into batches: Do we need them? How do they work?
# Idea: 

import sys
if __name__ == '__main__':
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
from backend.processing.modular_network import * 
from backend.processing.communication import send_update, is_cancelled
import backend.data_functions as df
import json
import pickle
#import torch
from django.core.cache import cache
from base64 import b64encode, b64decode

# an example input
# input_dict = {
#   'type': 1,  # 1 for classification, 2 for regression
#   'dataset': 'Clas1',  # the dataset to use
#   'n_inputs': 4,  # number of inputs
#   'n_outputs': 3,  # number of outputs
# 
#   'nodes': [4, 8, 8, 3]  # number of nodes per layer
#   'epochs': 200,  # number of epochs
#   'learning_rate': 0.005,  # learning rate
#   'af': True,  # use activation functions'
#   'normalization': True  # normalize the data
# }

# structure = [[n_inputs], (4, 'Linear', 'Sigmoid', True), (8, 'Linear', 'Sigmoid', True),
#             (4, 'Linear', 'Sigmoid', True), (n_outputs, 'Linear', 'Log_Softmax', True)]
# learning_rate = 0.005
# epochs = 200


def build_nn(structure, learning_rate, epochs, norma, dataset, typ, dat=None):
    if type(dataset) is not str:
        dat = dataset
        dataset = ''

    # get the data and separate into training and testing data:
    batch_size = 1  # feed small amounts of data to adjust gradient with, usually between 8 and 64
    test_size = 0.1  # 10% of the data is used for testing

    data = df.get_data(dataset, typ, norma, data=dat, test_size=test_size)
    training_set = torch.utils.data.DataLoader(data.training_set, batch_size=batch_size, shuffle=True)
    test_set = torch.utils.data.DataLoader(data.testing_set, batch_size=batch_size, shuffle=True)
    # shuffle: always turn on if dataset is ordered!
    print('Data loaded, initiating neural network')

    # initiate the network
    nn = BuildNetwork(structure)

    return nn, data, training_set, test_set


def train_nn_epoch(nn, training_set, test_set, current_epoch, epochs, learning_rate, typ, errors, optim):
    accuracy, weights, biases = None, None, None
    # optimizer has to be defined outside the network module, idk why
    if optim == 'adam' or optim == 'Adam':
        optimizer = torch.optim.Adam(nn.parameters(), lr=learning_rate)
    else:
        optimizer = torch.optim.SGD(nn.parameters(), lr=learning_rate)

    nn.train_epoch(training_set, optimizer, typ)

    if current_epoch % (epochs // 100 if epochs >= 100 else 1) == 0:
        error, accuracy = nn.test(test_set, typ, acc=False)  # TODO: should this be training_set or test_set?
        errors += [error]
        weights, biases = get_parameters(nn)
        
    if round(current_epoch/epochs, 2) >= 0.9 or current_epoch > epochs-2:
        error, accuracy = nn.test(test_set, typ, acc=True)

    return errors, accuracy, weights, biases


def train_nn(data, train_set, test_set, nn, epochs, learning_rate, typ, optimizer, user_id, task_id):
    # first, reset all variables
    progress = 0
    errors = []
    plot = None

    #send_update(user_id=user_id, task_id=task_id, var_names=['progress'], vars=(progress,))
    
    for epoch in range(1, epochs+1):
        if is_cancelled(user_id, task_id):
            print("Training cancelled")
            break
        
        print("Epoch: ", epoch)
        errors, accuracy, we, bi = train_nn_epoch(nn, train_set, test_set, epoch, epochs, learning_rate, typ, errors, optimizer)
        if we is not None:
            w = we
            b = bi
        if errors is not None:
                e = [errors, accuracy]

        if epoch % (epochs // 100 if epochs >= 100 else 1) == 0:  # every 1% of the total epochs:
            print("Updating progress")
            progress = round(epoch / epochs, 2)  # update the progress

            if epoch % (epochs // 50 if epochs >= 50 else 1) == 0:  # every 10% of the total epochs:
                print("Updating decision boundary")
                data.plot_decision_boundary(nn)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
                plot = b64encode(data.images[-1]).decode()  

                print("Epoch: ", epoch, ", Error: ", errors[-1])

            send_update(user_id=user_id, task_id=task_id, var_names=['progress', 'error_list', 'network_weights', 'network_biases', 'plot'], vars=(progress, e, w, b, plot))  # TODO: now sending only one update, plot just isn't always updated
    
    data.plot_decision_boundary(nn)  # plot the current decision boundary (will be ignored if the dataset has too many dimensions)
    plot = b64encode(data.images[-1]).decode()  
    progress = 1
    send_update(user_id=user_id, task_id=task_id, var_names=['progress', 'error_list', 'network_weights', 'network_biases', 'plot'], vars=(progress, e, w, b, plot))


def save_nn(user_id, nn, data):  # TODO check if this works from inside a subprocess
    print("About to save network and data to cache...")
    # save the network and data to pickle files and store them in the cache
    network = pickle.dumps(nn, -1)
    data = pickle.dumps(data, -1)
    cache.set(f'{user_id}_nn', network, 10*60)  # cache the network for 10 minutes
    cache.set(f'{user_id}_data', data, 10*60)  # cache the data for 10 minutes
    print("Network and data successfully saved to cache!")


def get_parameters(nn):
    weights = []
    biases = []
    for layer in nn.layers:
        weights += [layer.weight.data.tolist()]
        biases += [layer.bias.data.tolist()]
    return weights, biases


def predict(x, nn, typ, data, normalization=False, name=False):
    if typ == 1:
        if normalization:
            x = data.normalize(x)
        x = torch.tensor(x, dtype=torch.float32)
        output = torch.argmax(nn(x.view(-1, data.n_features))[0]).item()
        if name:
            output = data.label_name(output)
        return output

    elif typ == 2:
        if normalization:
            x = data.normalize(x)
        x = torch.tensor(x, dtype=torch.float32)
        output = nn(x.view(-1, data.n_features))[0]
        if normalization:
            output = data.denormalize(output.tolist())
        else:
            output = output.tolist()
        return output

    else:
        print("Task not supported yet")
        return None


def convert_input(nodes, n_inputs, n_outputs, typ, af='Sigmoid'):
    # basic settings
    structure = [[nodes[0]]]
    for x in nodes[1:]:
        structure += [[x, 'Linear', af, True]]
        # TODO: works for now: modular_network.py is hard-coded to include ReLU, Sigmoid, SiLU/Swish, TanH, Log_Softmax and Softmax

    assert structure[0][0] == n_inputs, structure
    assert structure[-1][0] == n_outputs, structure

    # modifications depending on tag
    if typ == 1:
        structure[-1][2] = 'Softmax'
    elif typ == 2:
        structure[-1][2] = ''

    # modifications depending on activation setting
    if not af:
        for x in structure[1:]:
            x[2] = ''

    return structure


def main(nodes, n_inputs, n_outputs, learning_rate, epochs, normalization, dataset, typ, user_id, task_id, optimizer, af):
    architecture = convert_input(nodes, n_inputs, n_outputs, typ, af=af)
    
    # build the neural network
    nn, data, training_set, testing_set = build_nn(architecture, learning_rate, epochs, normalization, dataset, typ)
    print("Network initiated, starting training")

    # now train the nn
    train_nn(data, training_set, testing_set, nn, epochs, learning_rate, typ, user_id=user_id, task_id=task_id)

    # finally, save the nn
    save_nn(user_id, nn, data)

    print("Secondary thread done.")


'''
def send_update(send_fn, progress, error_list=None, weights=None, biases=None, plot=None, block_id=None):  # TODO: replace this with cool way-too-advanced function
    d = {}
    d['header'] = 'update'
    d['progress'] = progress
    if block_id:
        d['block_id'] = block_id  # or task_id, so the frontend knows which block/challenge this is coming from 
    if error_list:
        d['error_list'] = error_list  # list of 2 entries: first one is list of errors for plotting, second one is accuracy on test set
    if weights:
        d['network_weights'] = weights  # list of lists of floats representing the weights
    if biases:
        d['network_biases'] = biases  # list of lists of floats representing the biases
    if plot:
        d['plot'] = plot  # base64 encoded image, showing pyplot of the data (potentially with decision boundary)

    print('sending update')
    send_fn(json.dumps(d))
    #print(json.dumps(d))  # print to the console, this will be captured by the parent process and sent to the frontend
'''
    