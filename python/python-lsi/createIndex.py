import logging
import os
import pickle
from gensim import corpora, models, similarities

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

if (os.path.exists("./corpus.dict")):
   dictionary = corpora.Dictionary.load('./corpus.dict')
   corpus = corpora.MmCorpus('./corpus.mm')
else:
   print("Please run createCorpus.py first")

tfidf = models.TfidfModel(corpus)

corpus_tfidf = tfidf[corpus]
for doc in corpus_tfidf:
    print(doc)

lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=100)
corpus_lsi = lsi[corpus_tfidf]
lsi.print_topics(10)

with open ('./docnames', 'rb') as dn:
    docnames = pickle.load(dn)

index = similarities.MatrixSimilarity(lsi[corpus])
index.save('./corpus.100.index')
