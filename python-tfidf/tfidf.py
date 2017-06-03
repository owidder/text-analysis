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
    stems = stem_tokens(tokens, stemmer)
    return stems

def convert(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1 \2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1 \2', s1).lower()

def fileString(file_path):
    shakes = open(file_path, 'r')
    text = shakes.read()
    no_punctuation = text.translate(string.punctuation)
    only_a_to_z = re.sub('[^A-Za-z ]+', ' ', no_punctuation)
    camel_case_split = convert(only_a_to_z)
    return camel_case_split

for subdir, dirs, files in os.walk(path):
    for file in files:
        file_path = subdir + os.path.sep + file
        if file_path.endswith("utf8"):
            token_dict[file] = fileString(file_path)

# this can take some time
tfidf = TfidfVectorizer(tokenizer=tokenize, stop_words='english')
tfs = tfidf.fit_transform(token_dict.values())
print(tfidf.get_feature_names())

feature_names = tfidf.get_feature_names()

str1 = fileString('/Users/owidder/dev/iteragit/nge/f2/AblaufServer/AblaufNachVerpflichtung.cc-utf8')
res1 = tfidf.transform([str1])

for col in res1.nonzero()[1]:
    print(feature_names[col], "\t", res1[0, col])
