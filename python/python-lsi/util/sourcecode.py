import re
import string

def convert(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1).lower()

def removeSingleChars(string):
    return ' '.join([w for w in string.split() if len(w) > 1])

def fileString(file_path):
    content = open(file_path, 'r')
    text = content.read()
    no_punctuation = text.translate(string.punctuation)
    only_a_to_z = re.sub('[^A-Za-z ]+', ' ', no_punctuation)
    camel_case_split = convert(only_a_to_z)
    camel_case_split_no_single_chars = removeSingleChars(camel_case_split)
    return camel_case_split_no_single_chars

