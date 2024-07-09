from django.contrib import admin
from django.contrib.auth.models import Group, User
from .databases.models import Row, TaskDescription, Quiz, Intro, Feedback, NeuralNetworkDescription, ClusteringDescription, ExternalLink

admin.site.register(Row)
admin.site.register(TaskDescription)
admin.site.register(NeuralNetworkDescription)
admin.site.register(ClusteringDescription)
admin.site.register(ExternalLink)
admin.site.register(Quiz)
admin.site.register(Intro)
admin.site.register(Feedback)