import pickle
from .util.sourcecode import fileString
from gensim import corpora, models, similarities

dictionary = corpora.Dictionary.load('./data/corpus.dict')
corpus = corpora.MmCorpus('./data/corpus.mm')

with open ('./data/docnames', 'rb') as dn:
    docnames = pickle.load(dn)

lsi = models.LsiModel.load('./data/corpus.lsi')
index = similarities.MatrixSimilarity.load('./data/corpus.100.index')

matrix_out_file = open('./data/matrix.csv', 'w')
vectors_out_file = open('./data/vectors.csv', 'w')
filenames_out_file = open('./data/filenames.csv', 'w')
whole_cloud_out_file = open('./data/whole_cloud.csv', 'w')

i = 0

for docname in docnames:
    print(docname, file=filenames_out_file)
    matrix_out_list = [docname]
    vectors_out_list = [docname]
    content = fileString(docname)
    vec_bow = dictionary.doc2bow(content.lower().split())
    vec_lsi = lsi[vec_bow]
    sims = index[vec_lsi]
    ssims = sorted(enumerate(sims), key=lambda item: -item[1])

    for entry in vec_lsi:
        vectors_out_list.append(str(entry[1]))

    for tuple in list(enumerate(ssims))[:10]:
        rel_docname = docnames[tuple[1][0]]
        str_value = str(tuple[1][1])
        if rel_docname != docname:
            matrix_out_list.append(rel_docname)
            matrix_out_list.append(str_value)

    tuple_list = []
    for tuple in list(enumerate(ssims)):
        if tuple[1][0] != i and tuple[1][1] > .5:
            tuple_list.append("%d\t%.4f" % (tuple[1][0], tuple[1][1]))

    print("\t".join(matrix_out_list), file=matrix_out_file)
    print("\t".join(vectors_out_list), file=vectors_out_file)
    print("\t".join(tuple_list), file=whole_cloud_out_file)

    i += 1