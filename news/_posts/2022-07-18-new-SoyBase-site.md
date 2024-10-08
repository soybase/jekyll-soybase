---
layout:     news-item
title:      Welcome to the new SoyBase site!
author:     Steven Cannon and Andrew Farmer
date:       2022-07-18
summary:    Announcing the new SoyBase
categories: general
---
The SoyBase team has re-designed and reengineered the site from the ground up, in order to better accommodate and make use of the dramatic influx of new, high-quality genomic data being generated for all legume crops. Here are some of the main changes:
* All data sets are now held in the SoyBase/LIS [Data Store](https://data.soybase.org/), with standardized naming patterns and metadata. The data are organized by genus and species, and then by data type. Data quality metrics are summarized in the [DSCensor tool](https://dscensor.legumeinfo.org). You are welcome to browse the Data Store and download file collections, if those serve your needs. This change helps us accommodate the high volumes of incoming data, requiring streamlined and regularized approaches to data curation. We hope the Data Store organization helps you to efficiently explore and find what you want.
* For all crops and models, we anticipate large numbers of genome assemblies and annotations; there is therefore a need to support pan-genome and pan-gene analyses. The [Genome Context Viewer](https://gcv.legumeinfo.org/) is a flexible and fast tool for exploring genomic regions in terms of gene content and gene-level synteny. We will be adding genus-level pan-gene collections later this year.
* To support complex queries, we are using InterMine. Mine instances are currently available for [more than 20 species, in eight genus-level mines](https://mines.legumeinfo.org).
* Many important traits have a common molecular basis across related species. Orthologs in, say, soybean, common bean, and cowpea, may be responsible for traits such as flowering time or determinacy. To help track down these correspondences, we offer the [ZZBrowse](https://zzbrowse.legumeinfo.org) tool, which allows comparisons of GWAS or QTL studies across pairs of species, with genomic features linked via synteny.
* Explore expression data in a phylogenetic context using the [Connekt comparative expression tool](https://conekt.legumeinfo.org/species/).
* We maintain a collection of legume-focused gene families, which are [searchable](https://funnotate.legumeinfo.org/?search) and viewable in interactive phylogenies - [like this, for example](https://funnotate.legumeinfo.org/?family=L_54XDXL).
* Annotate your submitted sequences using [Funnotate](https://funnotate.legumeinfo.org). This system determines functional annotations for submitted sequences, and places your sequences into the closest phylogenetic trees.
* Do [BLAST searches](https://sequenceserver.legumeinfo.org/) against most of the genomes and annotation sets at LIS.
* Explore geographical distribution and trait information in legume germplasm collections held in the U.S. National Plant Germplasm Repository System, with the [LIS Germplasm GIS viewer](https://germplasm-map.legumeinfo.org/).

For genetic/genomic database geeks who have an interest in the "how and why" of this change: we have switched from Drupal to Jekyll for handling the core website. [Jekyll](https://jekyllrb.com/), as a static site generator, offers light-weight and modular methods for generating the site from accessible data formats (yaml, tables, json, or markdown) and lightweight code (with the [liquid](https://shopify.github.io/liquid/) templating language). By driving site content directly from validated metadata held in the LIS Data Store and kept under revision control in a dedicated [github repository](https://github.com/legumeinfo/datastore-metadata), we thereby increase the consistency and coherence of different components of the site while maintaining agility in the face of increasing data volume. Interactive tools (described above) are written in more performant web languages, but ultimately source their data and metadata from these same files. If you'd like to contribute (or just see how the site is put together), the code and website data are in GitHub [here](https://github.com/legumeinfo/jekyll-legumeinfo).

With such a large site overhaul, we expect that LIS users will have questions about features that may have moved or may be handled differently in this new version. We very much welcome your questions! 
