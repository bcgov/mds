from . import register

class Verb(object):

    '''
    Every activity has a verb and an object.
    Nomenclatura is loosly based on
    http://activitystrea.ms/specs/atom/1.0/#activity.summary
    '''
    id = 0
    infinitive = ''

    def __str__(self):
        return self.infinitive

    def serialize(self):
        serialized = self.id
        return serialized

class Submit(Verb):
    id = 1
    infinitive = 'submit'
    past_tense = 'submitted'

register(Submit)
