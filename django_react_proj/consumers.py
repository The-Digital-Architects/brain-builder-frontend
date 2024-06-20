from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django_react_proj import processes

class Transceiver(AsyncWebsocketConsumer):
    connections = {}

    async def connect(self):
        print(f'Connection scope: {self.scope}')
        self.user_id = self.scope['url_route']['kwargs']['userId']
        #self.task_id = self.scope['url_route']['kwargs']['taskId']
        Transceiver.connections[self.user_id] = self
        print("switchboard connected")
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
            processes.cancel_vars[(self.user_id, task_id)] = False
            pc = instructions['process_code']
            processes.start_process(self.user_id, task_id, pc, instructions, self.send)
        
        elif task_type == 'cancel':
            task_id = instructions['task_id']  # watch out: this should be the notebook_id for notebooks!
            processes.cancel_vars[(self.user_id, task_id)] = True

        elif task_type == 'code':
            print(instructions['code'])
            nb_id = instructions['notebook_id']
            processes.cancel_vars[(self.user_id, nb_id)] = False
            processes.execute_code(instructions['code'], self.user_id, nb_id, self.send)
        

    # Send an update to the frontend
    async def send_data(self, data):
        task_type = data['header']
        print("sending data for task ", task_type)
        await self.send(json.dumps(data))


    # # function to handle subprocess output
    # async def handle_output(self, process):  # TODO: test this
    #     # Loop over the lines of the process's output
    #     for line in iter(process.stdout.readline, b''):
    #         # Send the line to the client
    #         self.send(json.dumps({"output": line.decode('utf-8')}))
    #     # Send the final state to the client
    #     websocket.send(json.dumps({"state": "finished"}))



# class Plotter(AsyncWebsocketConsumer):
    # async def connect(self):
    #     self.user_id = self.scope['url_route']['kwargs']['userId']
    #     self.custom_id = self.scope['url_route']['kwargs']['customId']
    #     if self.custom_id == '11':
    #         self.x, self.y = df.create_plot11()
    #     await self.accept()
    #     print("plotter connected")

    # async def disconnect(self, close_code):
    #     print("plotter disconnected")
    
    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     if self.custom_id == '11':
    #         print(data['title'], " received")
    #         plot, error = df.create_plot11(self.x, self.y, data['a'], data['b'])
    #         plot = b64encode(plot).decode()
    #         await self.send(json.dumps({'title': 'plot', 'plot': plot, 'error': error}))
    #         print("plot sent")
