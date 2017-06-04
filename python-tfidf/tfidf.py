import nltk
import string
import os
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.stem.porter import PorterStemmer

path = '/Users/owidder/dev/iteragit/nge/f2'
token_dict = {}
stemmer = PorterStemmer()

def stem_tokens(tokens, stemmer):
    stemmed = []
    for item in tokens:
        stemmed.append(stemmer.stem(item))
    return stemmed


def tokenize(text):
    tokens = nltk.word_tokenize(text)
    return tokens

def convert(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1).lower()

def removeSingleChars(string):
    return ' '.join([w for w in string.split() if len(w) > 1])

def fileString(file_path):
    shakes = open(file_path, 'r')
    text = shakes.read()
    no_punctuation = text.translate(string.punctuation)
    only_a_to_z = re.sub('[^A-Za-z ]+', ' ', no_punctuation)
    camel_case_split = convert(only_a_to_z)
    camel_case_split_no_single_chars = removeSingleChars(camel_case_split)
    return camel_case_split_no_single_chars

for subdir, dirs, files in os.walk(path):
    for file in files:
        file_path = subdir + os.path.sep + file
        if file_path.endswith("utf8"):
            token_dict[file] = fileString(file_path)

# this can take some time
tfidf = TfidfVectorizer(tokenizer=tokenize, stop_words='english')
tfs = tfidf.fit_transform(token_dict.values())

test_str = fileString('/Users/owidder/dev/eos/inkassosystem.entwicklung/src/oci/InkassoServer/BuchungServer/BuchungServer.cc')
print(test_str)
test_resp = tfidf.transform([test_str])

feature_names = tfidf.get_feature_names()
print(feature_names)
f = {}
for col in test_resp.nonzero()[1]:
    f[feature_names[col]] = test_resp[0, col]

sf = sorted(f, key=f.__getitem__)
for k in sf:
    print(k + ": " + str(f[k]))
