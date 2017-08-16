import logging
from gensim import corpora
from collections import defaultdict
import os
import pickle

from .util.sourcecode import fileString

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

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


documents = readDocuments('/Users/owidder/dev/iteragit/nge/python/OpenSpeedMonitor')

with open('./data/docnames', 'wb') as dn:
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
dictionary.save('./data/corpus.dict')
print(dictionary)

print(dictionary.token2id)

corpus = [dictionary.doc2bow(text) for text in texts]
corpora.MmCorpus.serialize('./data/corpus.mm', corpus)  # store to disk, for later use
print(corpus)
