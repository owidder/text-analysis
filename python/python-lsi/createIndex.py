import logging
import os
from gensim import corpora, models, similarities

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

dictionary = corpora.Dictionary.load('./data/corpus.dict')
corpus = corpora.MmCorpus('./data/corpus.mm')
tfidf = models.TfidfModel(corpus)

corpus_tfidf = tfidf[corpus]
lsi = models.LsiModel(corpus_tfidf, id2word=dictionary, num_topics=100)
lsi.save('./data/corpus.lsi')
corpus_lsi = lsi[corpus_tfidf]

index = similarities.MatrixSimilarity(lsi[corpus])
index.save('./data/corpus.100.index')
