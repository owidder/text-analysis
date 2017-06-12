import pickle
from .util.sourcecode import fileString
from gensim import corpora, models, similarities

dictionary = corpora.Dictionary.load('./data/corpus.dict')
corpus = corpora.MmCorpus('./data/corpus.mm')

with open ('./data/docnames', 'rb') as dn:
    docnames = pickle.load(dn)

lsi = models.LsiModel.load('./data/corpus.lsi')
index = similarities.MatrixSimilarity.load('./data/corpus.100.index')

for docname in docnames:
    content = fileString(docname)
    vec_bow = dictionary.doc2bow(content.lower().split())
    vec_lsi = lsi[vec_bow]
    sims = index[vec_lsi]
    for tuple in list(enumerate(sims)):
        print(tuple)