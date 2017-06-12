import logging
from gensim import corpora
from pprint import pprint  # pretty-printer
from collections import defaultdict
import string
import re
import os
import pickle

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

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


def readDocuments(path):
    documents = {}
    for subdir, dirs, files in os.walk(path):
        for file in files:
            file_path = subdir + os.path.sep + file
            if file_path.endswith("utf8"):
                content = fileString(file_path)
                if len(content) > 0:
                    documents[file_path] = fileString(file_path)
    return documents


documents = readDocuments('/Users/owidder/dev/iteragit/nge/python/erpnext/erpnext')

with open('./docnames', 'wb') as dn:
    pickle.dump(list(documents.keys()), dn)

stoplist = set('if for a of the and to in'.split())
texts = [[word for word in document.lower().split() if word not in stoplist]
         for document in list(documents.values())]

# remove words that appear only once
frequency = defaultdict(int)
for text in texts:
    for token in text:
        frequency[token] += 1

texts = [[token for token in text if frequency[token] > 1]
         for text in texts]

dictionary = corpora.Dictionary(texts)
dictionary.save('./corpus.dict')
print(dictionary)

print(dictionary.token2id)

corpus = [dictionary.doc2bow(text) for text in texts]
corpora.MmCorpus.serialize('./corpus.mm', corpus)  # store to disk, for later use
print(corpus)
