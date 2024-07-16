if __name__ == '__main__':
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
from backend.processing.communication import send_update
import numpy as np
import matplotlib.figure as f
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
    x = xVars.get((user_id, 'LinReg'))
    y = yVars.get((user_id, 'LinReg'))
    
    fig = f.Figure()
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

        send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, error[0], error[1]), task_id=task_id, user_id=user_id)

    else: 
        # set up the plot
        target_a = round(np.tan((np.random.random()/3)*np.pi), 3)
        target_b = round(np.random.randint(-5, 6), 3)
        x = np.random.randint(-10, 10, size=(100,))
        y = target_a*x + target_b + np.random.normal(0, 1.41, size=(100,))
    
        xVars[(user_id, 'LinReg')] = x
        yVars[(user_id, 'LinReg')] = y
        ManualLinReg(a, b, task_id, user_id)


def ManualPCA(a=None, task_id=None, user_id=None):
    """
    Creates a plot of some datapoints, along with a line ax + b. 
    Limits are -10 and +10 for both x and y. 
    Returns the plot as the value of a BytesIO object.
    """
    projection = True
    b = 0
    limits = (-10, 10)

    global xVars, yVars
    x = xVars.get((user_id, 'PCA'))
    y = yVars.get((user_id, 'PCA'))
    
    if x is not None and y is not None:
        fig = f.Figure(figsize=(10, 5))
        if projection: ax = fig.add_subplot(121)
        else: ax = fig.add_subplot(111)

        ax.scatter(x, y, color=(4/255, 151/255, 185/255))
        if a is not None and b is not None:
            x_s = np.linspace(limits[0], limits[1], 200)
            y_s = a*x_s + b
            ax.plot(x_s, y_s, color=(185/255,38/255,4/255))
        ax.set_xlim(limits[0], limits[1])
        ax.set_ylim(-10, 10)
        ax.set_title('Original Data')

        pts = (x + a*y) / np.sqrt(a**2 + 1)
        if projection:
            ax = fig.add_subplot(122)
            # project the points on the specified line and plot on the horizontal axis
            ax.scatter(pts, np.zeros_like(pts), color=(4/255, 151/255, 185/255))
            ax.set_xlim(-15, 15)
            ax.set_title('Projection')

        # save the image to a BytesIO and return it
        img = BytesIO()
        fig.tight_layout()
        fig.savefig(img, format='png')
        img.seek(0)
        fig.clear()

        # calculate the absolute variance and the explained variance of the projection on the line
        var = np.var(pts)
        total_var = np.cov(x, y)[0, 0] + np.cov(x, y)[1, 1]
        explained_var = var / total_var

        plot = img.getvalue()
        plot = b64encode(plot).decode()

        #send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, explained_var, None), task_id=task_id, user_id=user_id)

    else: 
        # set up the plot
        target_a = round(np.tan((np.random.random()/3)*np.pi), 3)
        target_b = 0
        x = np.random.randint(limits[0], limits[1], size=(50,))
        y = target_a*x + target_b + np.random.normal(0, 1.41, size=(50,))
    
        xVars[(user_id, 'PCA')] = x
        yVars[(user_id, 'PCA')] = y
        ManualPCA(a, task_id, user_id)


def ManualPolyReg(n=None, task_id=None, user_id=None):
    """
    Creates a plot of some datapoints along a sine wave, and finds a polynomial fit of order n. 
    Limits are 0 and +6.28 for both x and y. 
    Returns the plot as the value of a BytesIO object.
    """
    limits = (0, 6.28)

    global xVars, yVars
    x = xVars.get((user_id, 'PolyReg'))
    y = yVars.get((user_id, 'PolyReg'))

    if x is not None and y is not None:
        fig = f.Figure()
        ax = fig.add_subplot(111)

        x_s = np.linspace(limits[0], limits[1], 100)
        y_s = np.sin(x_s)
        ax.plot(x_s, y_s, color=(0/255,0/255,0/255), label='distribution')
        ax.scatter(x, y, color=(4/255, 151/255, 185/255), label='datapoints')

        if n is not None:
            x_s = np.linspace(limits[0], limits[1], 100)
            y_s = np.polyval(np.polyfit(x, y, n), x_s)
            ax.plot(x_s, y_s, color=(185/255,38/255,4/255), label='polynomial fit')
        ax.set_xlim(limits[0], limits[1])
        ax.set_ylim(-2, 2)
        ax.legend()

        img = BytesIO()
        fig.savefig(img, format='png')
        img.seek(0)
        fig.clear()

        plot = img.getvalue()
        plot = b64encode(plot).decode()
        
        send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, None, None), task_id=task_id, user_id=user_id)

    else: 
        x = np.random.rand(limits[0], limits[1], size=(10,))
        y = np.sin(x) + np.random.normal(0, 0.1, size=(10,))

        xVars[(user_id, 'PolyReg')] = x
        yVars[(user_id, 'PolyReg')] = y
        ManualPolyReg(n, task_id, user_id)

if __name__ == '__main__':
    ManualPCA(a=0)
