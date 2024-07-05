from django.core.management.base import BaseCommand, CommandError
import subprocess

class Command(BaseCommand):
    help = 'This command builds the jupyter lite static app and saves it to build/jupyter_lite.'

    # def add_arguments(self, parser):
        # # Optional: add arguments here

    def handle(self, *args, **options):
        try:
            # Build jupyter lite static app with specified output directory
            subprocess.check_call(['jupyter', 'lite', 'build', '--output-dir=../build/static/jupyter'], cwd='jupyter_lite', shell=True)
            
            self.stdout.write(self.style.SUCCESS('Successfully executed command'))
        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR('Error executing command'))
            raise CommandError('Error executing command') from e
