from backend.processing.communication import send_update
import sys
import numpy as np
import matplotlib as mpl
import matplotlib.pyplot as plt
from io import BytesIO  # for saving the images
from base64 import b64encode  # for encoding the images


def tset(sometext):
    # reverse the text
    print(sometext[::-1])


xVars = {}
yVars = {}

def ManualLinReg(a=None, b=None, task_id=None, user_id=None):
    """
    Creates a plot of some datapoints, along with a line ax + b. 
    Limits are -10 and +10 for both x and y. 
    Returns the plot as the value of a BytesIO object.
    """

    global xVars, yVars
    x = xVars.get(user_id)
    y = yVars.get(user_id)
    
    fig = mpl.figure.Figure()
    ax = fig.add_subplot(111)
    if x is not None and y is not None:
        ax.scatter(x, y, color=(4/255, 151/255, 185/255))
        if a is not None and b is not None:
            x_s = np.linspace(-10, 10, 200)
            y_s = a*x_s + b
            ax.plot(x_s, y_s, color=(185/255,38/255,4/255))
        ax.set_xlim(-10, 10)
        ax.set_ylim(-10, 10)
        # save the image to a BytesIO and return it
        img = BytesIO()
        fig.savefig(img, format='png')
        img.seek(0)
        fig.clear()

        mse = np.mean((a*x + b - y)**2)
        r2 = 1 - mse / np.var(y)

        plot = img.getvalue()
        plot = b64encode(plot).decode()
        error = (mse, r2)

        send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, error[0], error[2]), task_id=task_id, user_id=user_id)

    else: 
        # set up the plot
        a = round(np.tan((np.random.random()/3)*np.pi), 3)
        b = round(np.random.randint(-5, 6), 3)
        x = np.random.randint(-10, 10, size=(100,))
        y = a*x + b + np.random.normal(0, 1.41, size=(100,))
    
        xVars[user_id] = x
        yVars[user_id] = y
        ManualLinReg(a, b, task_id, user_id)


def ManualPCA(a=None, b=None, task_id=None, user_id=None):
    """
    Creates a plot of some datapoints, along with a line ax + b. 
    Limits are -10 and +10 for both x and y. 
    Returns the plot as the value of a BytesIO object.
    """

    global xVars, yVars
    x = xVars.get(user_id)
    y = yVars.get(user_id)
    
    fig = mpl.figure.Figure()
    ax = fig.add_subplot(111)
    if x is not None and y is not None:
        ax.scatter(x, y, color=(4/255, 151/255, 185/255))
        if a is not None and b is not None:
            x_s = np.linspace(-10, 10, 200)
            y_s = a*x_s + b
            ax.plot(x_s, y_s, color=(185/255,38/255,4/255))
        ax.set_xlim(-10, 10)
        ax.set_ylim(-10, 10)
        # save the image to a BytesIO and return it
        img = BytesIO()
        fig.savefig(img, format='png')
        img.seek(0)
        fig.clear()

        # find the points which are the projections of the points (x, y) on the line y_s = a*x_s + b
        ...

        # calculate the absolute variance and the explained variance of the projection on the line
        var = np.var((a*x + b) / np.sqrt(a**2 + 1))
        total_var = np.cov(x, y)[0, 0] + np.cov(x, y)[1, 1]
        explained_var = np.var(a*x + b) / total_var

        plot = img.getvalue()
        plot = b64encode(plot).decode()

        send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, explained_var, None), task_id=task_id, user_id=user_id)

    else: 
        # set up the plot
        a = round(np.tan((np.random.random()/3)*np.pi), 3)
        b = round(np.random.randint(-5, 6), 3)
        x = np.random.randint(-10, 10, size=(100,))
        y = a*x + b + np.random.normal(0, 1.41, size=(100,))
    
        xVars[user_id] = x
        yVars[user_id] = y
        ManualPCA(a, b, task_id, user_id)


def ManualPolyReg(n=None, task_id=None, user_id=None):
    """
    Creates a plot of some datapoints along a sine wave, and finds a polynomial fit of order n. 
    Limits are -10 and +10 for both x and y. 
    Returns the plot as the value of a BytesIO object.
    """

    x = np.random.randint(-10, 10, size=(10,))
    y = np.sin(x) + np.random.normal(0, 0.1, size=(10,))
    
    fig = mpl.figure.Figure()
    ax = fig.add_subplot(111)

    x_s = np.linspace(-10, 10, 200)
    y_s = np.sin(x_s)
    ax.plot(x_s, y_s, color=(0/255,0/255,0/255))
    ax.scatter(x, y, color=(4/255, 151/255, 185/255))

    if n is not None:
        x_s = np.linspace(-10, 10, 200)
        y_s = np.polyval(np.polyfit(x, y, n))
        ax.plot(x_s, y_s, color=(185/255,38/255,4/255))
    ax.set_xlim(-10, 10)
    ax.set_ylim(-10, 10)

    img = BytesIO()
    fig.savefig(img, format='png')
    img.seek(0)
    fig.clear()

    plot = img.getvalue()
    plot = b64encode(plot).decode()
    
    send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, None, None), task_id=task_id, user_id=user_id)
