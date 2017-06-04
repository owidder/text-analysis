import nltk
import string
import os
import re

from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.stem.porter import PorterStemmer

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

def tokenizePath(path):
    token_dict = {}
    for subdir, dirs, files in os.walk(path):
        for file in files:
            file_path = subdir + os.path.sep + file
            if file_path.endswith("utf8"):
                token_dict[file] = fileString(file_path)
    return token_dict

def fit(corpusPath):
    token_dict = tokenizePath(corpusPath)
    tfidf = TfidfVectorizer(tokenizer=tokenize, stop_words='english')
    tfidf.fit_transform(token_dict.values())
    return tfidf

def findFeatures(corpusPath, rootPath):
    tfidf = fit(corpusPath=corpusPath)
    for subdir, dirs, files in os.walk(rootPath):
        for file in files:
            file_path = subdir + os.path.sep + file
            if file_path.endswith("utf8"):
                file_str = fileString(file_path)
                file_response = tfidf.transform([file_str])
                feature_names = tfidf.get_feature_names()

                f = {}
                for col in file_response.nonzero()[1]:
                    f[feature_names[col]] = file_response[0, col]

                out_file = open(file_path + ".csv", 'w')
                sf = sorted(f, key=f.__getitem__, reverse=True)
                for k in sf:
                    print(k + "\t" + str(f[k]), file=out_file)


findFeatures(corpusPath='/Users/owidder/dev/iteragit/nge/f2', rootPath='/Users/owidder/dev/iteragit/nge/f2')