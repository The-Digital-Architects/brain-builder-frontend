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
zVars = {}

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
    Also creates the projection of the datapoints on the line.
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

            # make this look like a 1D-plot
            ax.spines['left'].set_color('none') 
            ax.spines['right'].set_color('none')
            ax.spines['top'].set_color('none')  
            ax.spines['bottom'].set_position('zero')  # Position the bottom spine at y=0
            ax.yaxis.set_ticks_position('none')  # Remove y-axis ticks
            ax.set_yticks([])  # Remove values as well

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

        send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, explained_var, None), task_id=task_id, user_id=user_id)

    else: 
        # set up the plot
        target_a = round(np.tan((np.random.random()/3)*np.pi), 3)
        target_b = 0
        x = np.random.randint(limits[0], limits[1], size=(50,))
        y = target_a*x + target_b + np.random.normal(0, 1.41, size=(50,))
    
        xVars[(user_id, 'PCA')] = x
        yVars[(user_id, 'PCA')] = y
        ManualPCA(a, task_id, user_id)


def Manual3DPCA(angle=None, task_id=None, user_id=None):
    """
    Creates a 3D plot of some datapoints, along with a plane ax + b. 
    Limits are -10 and +10 for x, y and z. 
    Also creates the projection of the datapoints on the plane.
    Returns the plot as the value of a BytesIO object.
    """
    limits = (-10, 10)

    global xVars, yVars, zVars
    x = xVars.get((user_id, 'PCA2'))
    y = yVars.get((user_id, 'PCA2'))
    z = zVars.get((user_id, 'PCA2'))
    
    if x is not None and y is not None:
        fig = f.Figure(figsize=(10, 5))
        ax = fig.add_subplot(121, projection='3d')

        # plot the datapoints in blue
        ax.scatter(x, y, z, color=(4/255, 151/255, 185/255))

        if angle is not None:
            # plot the plane in grey
            x_s = np.linspace(limits[0], limits[1], 100)
            y_s = np.linspace(limits[0], limits[1], 100)
            x_s, y_s = np.meshgrid(x_s, y_s)
            mask = np.sqrt(x_s**2 + y_s**2) <= min(abs(limits[0]), abs(limits[1]))
            x_s = x_s[mask]
            y_s = y_s[mask]
            z_s = -np.cos(np.radians(angle))*x_s - np.sin(np.radians(angle))*y_s
            ax.plot(x_s, y_s, z_s, color=(200/255, 200/255, 200/255))

            # plot the vector in red
            l = 10
            x_1 = np.cos(np.radians(angle))*np.sqrt(l/2)
            y_1 = np.sin(np.radians(angle))*np.sqrt(l/2)
            z_1 = np.sqrt(l/2)
            ax.quiver(0, 0, 0, x_1, y_1, z_1, color=(185 / 255, 38 / 255, 4 / 255))

        ax.set_xlim(limits[0], limits[1])
        ax.set_ylim(limits[0], limits[1])
        ax.set_zlim(limits[0], limits[1])
        ax.set_title('Original Data')

        projected_x_s = -x*np.sin(angle) + y*np.cos(angle)
        projected_y_s = (-x*np.cos(angle) - y*np.sin(angle) + 3*z)/(2*np.sqrt(2))
        projected_z_s = (x*np.cos(angle) + y*np.sin(angle) + z)/2
        ax = fig.add_subplot(122)
        # project the points on the specified plane and plot in 2D
        ax.scatter(projected_x_s, projected_y_s, color=(4/255, 151/255, 185/255))
        ax.set_xlim(-1.5*limits[0], 1.5*limits[0])
        ax.set_ylim(-1.5*limits[0], 1.5*limits[0])
        ax.set_title('Projection')

        # save the image to a BytesIO and return it
        img = BytesIO()
        fig.tight_layout()
        fig.savefig('projection_plot.png', format='png')
        fig.savefig(img, format='png')
        img.seek(0)
        fig.clear()

        # calculate the absolute variance and the explained variance of the projection on the plane
        matrix = np.array([projected_x_s, projected_y_s, projected_z_s])
        cov_matrix = np.cov(matrix)
        var = cov_matrix[0, 0] + cov_matrix[1, 1]
        total_var = np.trace(cov_matrix)
        explained_var = var / total_var

        plot = img.getvalue()
        plot = b64encode(plot).decode()

        send_update(header='plot', var_names=['plot', 'out1', 'out2'], vars=(plot, explained_var, None), task_id=task_id, user_id=user_id)

    else: 
        # set up the plot
        target_angle = np.random.randint(0, 180)
        x = np.random.randint(0.9*limits[0], 0.9*limits[1], size=(50,))
        y = np.random.randint(0.9*limits[0], 0.9*limits[1], size=(50,))
        z = np.cos(np.radians(target_angle))*x + np.sin(np.radians(target_angle))*y + np.random.normal(0, 1.41, size=(50,))
    
        xVars[(user_id, 'PCA2')] = x
        yVars[(user_id, 'PCA2')] = y
        zVars[(user_id, 'PCA2')] = z
        Manual3DPCA(angle, task_id, user_id)


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
        x = np.random.rand(10) * (limits[1] - limits[0]) + limits[0]
        y = np.sin(x) + np.random.normal(0, 0.1, size=(10,))

        xVars[(user_id, 'PolyReg')] = x
        yVars[(user_id, 'PolyReg')] = y
        ManualPolyReg(n, task_id, user_id)


if __name__ == '__main__':
    Manual3DPCA(angle=45, task_id=11, user_id='laurens')
