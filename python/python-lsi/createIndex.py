import logging
import os
from gensim import corpora, models, similarities

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

if (os.path.exists("./corpus.dict")):
   dictionary = corpora.Dictionary.load('./corpus.dict')
   corpus = corpora.MmCorpus('./corpus.mm')
else:
   print("Please run createCorpus.py first")

tfidf = models.TfidfModel(corpus)

corpus_tfidf = tfidf[corpus]
lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=100)
lsi.save('./corpus.lsi')
corpus_lsi = lsi[corpus_tfidf]

index = similarities.MatrixSimilarity(lsi[corpus])
index.save('./corpus.100.index')
