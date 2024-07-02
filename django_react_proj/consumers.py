from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import json
from django_react_proj import processes
from backend.processing import communication

class Transceiver(AsyncWebsocketConsumer):
    connections = {}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.trigger = asyncio.Event()

    async def connect(self):
        print(f'Connection scope: {self.scope}')
        self.user_id = self.scope['url_route']['kwargs']['userId']
        #self.task_id = self.scope['url_route']['kwargs']['taskId']
        Transceiver.connections[self.user_id] = self
        print("switchboard connected")
        #await self.send(json.dumps({'header': 'connected'}))
        await self.accept()

    async def disconnect(self, close_code):
        del Transceiver.connections[self.user_id]
        print("switchboard disconnected")
        
    # Receive message from WebSocket
    async def receive(self, text_data):
        instructions = json.loads(text_data)
        task_type = instructions['header']
        print("instructions received, preparing for task ", task_type)

        if task_type == 'start':
            # start the process
            task_id = instructions['task_id']
            communication.cancel_vars[(self.user_id, task_id)] = False

            asyncio.create_task(self.trigger_send(task_id))

            processes.run(file_name=instructions['file_name'], function_name=instructions['function_name'], args=instructions, send_fn=self.notify)
        
        elif task_type == 'cancel':
            task_id = instructions['task_id']  # watch out: this should be the notebook_id for notebooks!
            communication.cancel_vars[(self.user_id, task_id)] = True

        elif task_type == 'code':
            nb_id = instructions['notebook_id']
            communication.cancel_vars[(self.user_id, nb_id)] = False
            await processes.execute_code(instructions['code'], self.user_id, nb_id, send_fn=self.send)
        

    # Send an update to the frontend
    async def send_data(self, data):
        task_type = data['header']
        print("sending data for task ", task_type)
        await self.send(json.dumps(data))

        #ping = {'header': 'ping'}
        #self.send(json.dumps(ping))
        #await self.send_data(ping)
    

    async def trigger_send(self, task_id):
        while Transceiver.connections.get(self.user_id) is not None:
            await self.trigger.wait()
            if communication.message_vars.get((str(self.user_id), str(task_id))) is not None:
                # Assuming 'message' is structured as a dictionary that needs to be sent as JSON:
                await self.send_data(communication.message)
                
                communication.message_vars[(str(self.user_id), str(task_id))] = None  # clear the message
            await asyncio.sleep(0.1)  # adjust the interval as needed

    def notify(self):
        self.trigger.set()


    # # function to handle subprocess output
    # async def handle_output(self, process):  # TODO: test this
    #     # Loop over the lines of the process's output
    #     for line in iter(process.stdout.readline, b''):
    #         # Send the line to the client
    #         self.send(json.dumps({"output": line.decode('utf-8')}))
    #     # Send the final state to the client
    #     websocket.send(json.dumps({"state": "finished"}))



# class Plotter(AsyncWebsocketConsumer):
    #     ...
    #     if self.custom_id == '11':
    #         print(data['title'], " received")
    #         plot, error = df.create_plot11(self.x, self.y, data['a'], data['b'])
    #         plot = b64encode(plot).decode()
    #         await self.send(json.dumps({'title': 'plot', 'plot': plot, 'error': error}))
    #         print("plot sent")
