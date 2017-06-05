import nltk
import string
import re

from collections import Counter

def convert(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1).lower()

def get_tokens():
   with open('/Users/owidder/dev/eos/inkassosystem.entwicklung/src/oci/InkassoServer/AblaufServer/AblaufNachVerpflichtung.cc', 'r') as shakes:
    text = shakes.read()
    #remove the punctuation using the character deletion step of translate
    no_punctuation = text.translate(string.punctuation)
    only_a_to_z = re.sub('[^A-Za-z ]+', '', no_punctuation)
    camel_case_split = convert(only_a_to_z)
    tokens = nltk.word_tokenize(camel_case_split)
    return tokens

tokens = get_tokens()
count = Counter(tokens)
print(count.most_common(100))
