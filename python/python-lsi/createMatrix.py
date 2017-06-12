import pickle
from .util.sourcecode import fileString
from gensim import corpora, models, similarities

dictionary = corpora.Dictionary.load('./corpus.dict')
corpus = corpora.MmCorpus('./corpus.mm')

with open ('./docnames', 'rb') as dn:
    docnames = pickle.load(dn)

lsi = models.LsiModel.load('./corpus.lsi')

for docname in docnames:
    content = fileString(docname)
    vec_bow = dictionary.doc2bow(content.lower().split())
    vec_lsi = lsi[vec_bow] # convert the query to LSI space
    print(vec_lsi)