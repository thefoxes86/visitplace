/**
 * Photos of the seeded places, from Wikimedia Commons: free licences that ask for the author,
 * the licence and the source to be credited, as the place pages do. Generated from the Commons API.
 */
import type { SeedPoi } from '../data/pois.ts'

export const seedPhotos: Record<string, Pick<SeedPoi, 'imageUrl' | 'imageCredit' | 'gallery'>> = {
  "pedona": {
    "gallery": [],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/5/53/Campanile_Pedona.jpg",
    "imageCredit": {
      "author": "Davide Campanaro",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Campanile_Pedona.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "monteggiori": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Chi_Va_L%C3%A0_%28138694285%29.jpeg/1920px-Chi_Va_L%C3%A0_%28138694285%29.jpeg",
    "imageCredit": {
      "author": "Sarvegu",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chi_Va_L%C3%A0_(138694285).jpeg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "montemagno": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Camaiore%2C_chiesa_di_montemagno_01.JPG/1920px-Camaiore%2C_chiesa_di_montemagno_01.JPG",
    "imageCredit": {
      "author": "sailko",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_chiesa_di_montemagno_01.JPG",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "gombitelli": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Pgr_Gombitelli_%28fr_Camaiore%29_-_San_Michele_Arcangelo_1_o6o.jpg/1920px-Pgr_Gombitelli_%28fr_Camaiore%29_-_San_Michele_Arcangelo_1_o6o.jpg",
        "caption": "La chiesa di San Michele Arcangelo, con l'orologio a sei ore",
        "credit": {
          "author": "Pere Garcia",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pgr_Gombitelli_(fr_Camaiore)_-_San_Michele_Arcangelo_1_o6o.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Emerald_beauty.jpg/1920px-Emerald_beauty.jpg",
    "imageCredit": {
      "author": "Nataliia Vietchinkina",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Emerald_beauty.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "metato": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Camaiore%2C_Metato%2C_vicolo_della_Bottega.jpg/1920px-Camaiore%2C_Metato%2C_vicolo_della_Bottega.jpg",
        "caption": "Il vicolo della Bottega",
        "credit": {
          "author": "Naioli",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_Metato,_vicolo_della_Bottega.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Camaiore%2C_Metato%2C_sentiero.jpg/1920px-Camaiore%2C_Metato%2C_sentiero.jpg",
        "caption": "Il sentiero verso il paese",
        "credit": {
          "author": "Naioli",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_Metato,_sentiero.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Camaiore%2C_Metato%2C_vista.jpg/1920px-Camaiore%2C_Metato%2C_vista.jpg",
    "imageCredit": {
      "author": "Naioli",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_Metato,_vista.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "candalla": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Resti_di_ex_opifici.jpg",
        "caption": "I resti degli antichi opifici",
        "credit": {
          "author": "Teresa1997",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Resti_di_ex_opifici.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mulino-candalla-1.jpg",
    "imageCredit": {
      "author": "Teresa1997",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mulino-candalla-1.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "cascate-di-candalla": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Bagni_d%27estate_in_Candalla.jpg",
        "caption": "Bagni d'estate nelle pozze",
        "credit": {
          "author": "Teresa1997",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Bagni_d%27estate_in_Candalla.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Main_candalla.jpg",
    "imageCredit": {
      "author": "Teresa1997",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Main_candalla.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "casoli": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Camaiore%2C_Casoli%2C_vista_parte_sud.jpg/1920px-Camaiore%2C_Casoli%2C_vista_parte_sud.jpg",
        "caption": "La parte sud del paese",
        "credit": {
          "author": "Naioli",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_Casoli,_vista_parte_sud.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      },
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Torre_civica_Casoli.jpg",
        "caption": "La torre civica di Piazza Nuova",
        "credit": {
          "author": "Davide Campanaro",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Torre_civica_Casoli.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      },
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Chiesa_di_San_Rocco_Casoli.jpg",
        "caption": "La chiesa di San Rocco",
        "credit": {
          "author": "Davide Campanaro",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Rocco_Casoli.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Camaiore%2C_Casoli%2C_vista.jpg/1920px-Camaiore%2C_Casoli%2C_vista.jpg",
    "imageCredit": {
      "author": "Naioli",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_Casoli,_vista.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "lombrici": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Interno_della_chiesa_di_San_Biagio%2C_Lombrici.JPG/1920px-Interno_della_chiesa_di_San_Biagio%2C_Lombrici.JPG",
        "caption": "L'interno della chiesa di San Biagio",
        "credit": {
          "author": "Mongolo1984",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Interno_della_chiesa_di_San_Biagio,_Lombrici.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Camaiore_-_Chiesa_di_San_Biagio_-_2025-09-04_13-28-00_001.jpg/1920px-Camaiore_-_Chiesa_di_San_Biagio_-_2025-09-04_13-28-00_001.jpg",
    "imageCredit": {
      "author": "Sgado walter",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore_-_Chiesa_di_San_Biagio_-_2025-09-04_13-28-00_001.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "museo-archeologico": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Camaiore%2C_palazzo_distaccato_del_comune%2C_sede_museo_archeologico_e_biblioteca.JPG/1920px-Camaiore%2C_palazzo_distaccato_del_comune%2C_sede_museo_archeologico_e_biblioteca.JPG",
    "imageCredit": {
      "author": "sailko",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_palazzo_distaccato_del_comune,_sede_museo_archeologico_e_biblioteca.JPG",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "museo-arte-sacra": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Camaiore%2C_museo_d%27arte_sacra_2.JPG/1920px-Camaiore%2C_museo_d%27arte_sacra_2.JPG",
        "caption": "",
        "credit": {
          "author": "sailko",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_museo_d%27arte_sacra_2.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Camaiore%2C_museo_d%27arte_sacra.JPG/1920px-Camaiore%2C_museo_d%27arte_sacra.JPG",
    "imageCredit": {
      "author": "sailko",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_museo_d%27arte_sacra.JPG",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "castello-di-montemagno": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Castello_di_Montemagno.JPG/1920px-Castello_di_Montemagno.JPG",
        "caption": "",
        "credit": {
          "author": "Luca Ghio",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Castello_di_Montemagno.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Montemagno_-_Castello_-_2023-09-01_10-22-14_001.jpg/1920px-Montemagno_-_Castello_-_2023-09-01_10-22-14_001.jpg",
        "caption": "Un particolare del castello",
        "credit": {
          "author": "Bubici",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Montemagno_-_Castello_-_2023-09-01_10-22-14_001.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Montemagno_-_Castello_di_Montemagno_-_2023-09-27_23-10-15_001.jpg/1920px-Montemagno_-_Castello_di_Montemagno_-_2023-09-27_23-10-15_001.jpg",
    "imageCredit": {
      "author": "Domeian",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Montemagno_-_Castello_di_Montemagno_-_2023-09-27_23-10-15_001.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "montecastrese": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/8/80/Montecastrese_-_rilievi.jpg",
        "caption": "Il rilievo del castello",
        "credit": {
          "author": "Luca Santini",
          "license": "Pubblico dominio",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Montecastrese_-_rilievi.jpg",
          "licenseUrl": null
        }
      }
    ],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/1/19/MONTECTORR.jpg",
    "imageCredit": {
      "author": "Luca Santini 54",
      "license": "Pubblico dominio",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:MONTECTORR.jpg",
      "licenseUrl": null
    }
  },
  "porta-lombricese": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Camaiore-porta_san_pietro_lombricense-meridiana.jpg/1920px-Camaiore-porta_san_pietro_lombricense-meridiana.jpg",
        "caption": "La meridiana della porta",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-porta_san_pietro_lombricense-meridiana.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Camaiore-porta_san_pietro_lombricense-affresco.jpg/1920px-Camaiore-porta_san_pietro_lombricense-affresco.jpg",
    "imageCredit": {
      "author": "Davide Papalini",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-porta_san_pietro_lombricense-affresco.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "piazza-san-bernardino": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Camaiore%2C_fontana_nella_piazza_principale_01.JPG/1920px-Camaiore%2C_fontana_nella_piazza_principale_01.JPG",
        "caption": "La fontana della piazza",
        "credit": {
          "author": "sailko",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_fontana_nella_piazza_principale_01.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Camaiore-fontana_piazza_san_bernardino.jpg/1920px-Camaiore-fontana_piazza_san_bernardino.jpg",
    "imageCredit": {
      "author": "Davide Papalini",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-fontana_piazza_san_bernardino.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "ferriera-dei-barsi": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Utensili_in_ferro_battuto.jpg",
        "caption": "Utensili in ferro battuto",
        "credit": {
          "author": "Teresa1997",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Utensili_in_ferro_battuto.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Ferriera_Barsi.jpg",
    "imageCredit": {
      "author": "Teresa1997",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ferriera_Barsi.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "grotta-all-onda": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Grotta_all%27onda.jpg/1920px-Grotta_all%27onda.jpg",
    "imageCredit": {
      "author": "Brachistocrone 21",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Grotta_all%27onda.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "monte-matanna": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Croce_di_vetta_del_Monte_Matanna_%2816-06-2018%29.jpg/1920px-Croce_di_vetta_del_Monte_Matanna_%2816-06-2018%29.jpg",
        "caption": "La croce di vetta",
        "credit": {
          "author": "Franitto",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Croce_di_vetta_del_Monte_Matanna_(16-06-2018).jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Vista_verso_ovest-nord-ovest_dal_Monte_Piglione_%2825-09-2018-ZOOM%29.jpg/1920px-Vista_verso_ovest-nord-ovest_dal_Monte_Piglione_%2825-09-2018-ZOOM%29.jpg",
        "caption": "Il Matanna visto dal Monte Piglione",
        "credit": {
          "author": "Franitto",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Vista_verso_ovest-nord-ovest_dal_Monte_Piglione_(25-09-2018-ZOOM).jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Rifugio_Alto_Matanna.jpg/1920px-Rifugio_Alto_Matanna.jpg",
        "caption": "Il rifugio Alto Matanna",
        "credit": {
          "author": "Gabriele85",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rifugio_Alto_Matanna.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Matanna_2.jpg/1920px-Matanna_2.jpg",
    "imageCredit": {
      "author": "Simone Dal Pino",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Matanna_2.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "pontile-lido-di-camaiore": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Lido_di_Camaiore%2C_Italy.jpg",
        "caption": "",
        "credit": {
          "author": "Ævar Guðmundsson",
          "license": "CC BY 2.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lido_di_Camaiore,_Italy.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by/2.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Pontile_di_Lido_di_Camaiore%2C_55041_Lido_di_Camaiore_LU%2C_Italy_-_panoramio.jpg/1920px-Pontile_di_Lido_di_Camaiore%2C_55041_Lido_di_Camaiore_LU%2C_Italy_-_panoramio.jpg",
    "imageCredit": {
      "author": "Анжела Карпинская",
      "license": "CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pontile_di_Lido_di_Camaiore,_55041_Lido_di_Camaiore_LU,_Italy_-_panoramio.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0"
    }
  },
  "villa-borbone-delle-pianore": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Villa_delle_Pianore_%28Viareggio%29_dove_si_sposarono_Ferdinando_di_Bulgaria_e_Maria_Luisa.jpg",
        "caption": "La villa in una foto storica, al tempo delle nozze di Ferdinando di Bulgaria e Maria Luisa",
        "credit": {
          "author": "Autore sconosciuto",
          "license": "Pubblico dominio",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Villa_delle_Pianore_(Viareggio)_dove_si_sposarono_Ferdinando_di_Bulgaria_e_Maria_Luisa.jpg",
          "licenseUrl": null
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Villa_Borbone_delle_Pianore.jpg/1920px-Villa_Borbone_delle_Pianore.jpg",
    "imageCredit": {
      "author": "9002Jack",
      "license": "CC0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Villa_Borbone_delle_Pianore.jpg",
      "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en"
    }
  },
  "teatro-dell-olivo": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Camaiore%2C_teatro_comunale_01.JPG/1920px-Camaiore%2C_teatro_comunale_01.JPG",
        "caption": "",
        "credit": {
          "author": "sailko",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_teatro_comunale_01.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Camaiore%2C_teatro_comunale_02.JPG/1920px-Camaiore%2C_teatro_comunale_02.JPG",
    "imageCredit": {
      "author": "sailko",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_teatro_comunale_02.JPG",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "collegiata": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Camaiore-collegiata_santa_maria_assunta-complesso.jpg/1920px-Camaiore-collegiata_santa_maria_assunta-complesso.jpg",
        "caption": "La Collegiata e il suo complesso",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-collegiata_santa_maria_assunta-complesso.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Camaiore-collegiata_santa_maria_assunta-campanile.jpg/1920px-Camaiore-collegiata_santa_maria_assunta-campanile.jpg",
        "caption": "Il campanile trecentesco",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-collegiata_santa_maria_assunta-campanile.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Camaiore%2C_collegiata_di_Santa_Maria_Assunta_-_Cantoria_e_organo_maggiore.jpg/1920px-Camaiore%2C_collegiata_di_Santa_Maria_Assunta_-_Cantoria_e_organo_maggiore.jpg",
        "caption": "La cantoria con l'organo di Paolino Bertolucci",
        "credit": {
          "author": "Pufui PcPifpef",
          "license": "CC BY-SA 4.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_collegiata_di_Santa_Maria_Assunta_-_Cantoria_e_organo_maggiore.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Camaiore-collegiata_santa_maria_assunta-facciata.jpg/1920px-Camaiore-collegiata_santa_maria_assunta-facciata.jpg",
    "imageCredit": {
      "author": "Davide Papalini",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-collegiata_santa_maria_assunta-facciata.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "chiesa-di-san-michele": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Camaiore%2C_san_michele_02.JPG/1920px-Camaiore%2C_san_michele_02.JPG",
        "caption": "",
        "credit": {
          "author": "sailko",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_san_michele_02.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Camaiore%2C_san_michele_03.JPG/1920px-Camaiore%2C_san_michele_03.JPG",
        "caption": "",
        "credit": {
          "author": "sailko",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_san_michele_03.JPG",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Camaiore%2C_san_michele_01.JPG/1920px-Camaiore%2C_san_michele_01.JPG",
    "imageCredit": {
      "author": "sailko",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore,_san_michele_01.JPG",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "chiesa-di-san-lazzaro": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Camaiore-chiesa_di_san_lazzaro_ai_frati-affresco.jpg/1920px-Camaiore-chiesa_di_san_lazzaro_ai_frati-affresco.jpg",
        "caption": "L'affresco di San Lazzaro",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-chiesa_di_san_lazzaro_ai_frati-affresco.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Camaiore-cappella_di_san_lazzaro_ai_frati-complesso1.jpg/1920px-Camaiore-cappella_di_san_lazzaro_ai_frati-complesso1.jpg",
        "caption": "La cappella di San Lazzaro ai Frati",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-cappella_di_san_lazzaro_ai_frati-complesso1.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Camaiore-chiesa_di_san_lazzaro_ai_frati-complesso1.jpg/1920px-Camaiore-chiesa_di_san_lazzaro_ai_frati-complesso1.jpg",
    "imageCredit": {
      "author": "Davide Papalini",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-chiesa_di_san_lazzaro_ai_frati-complesso1.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "badia-san-pietro": {
    "gallery": [
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Camaiore-badia_san_pietro-complesso_esterno2.jpg/1920px-Camaiore-badia_san_pietro-complesso_esterno2.jpg",
        "caption": "Il campanile con i merli ghibellini",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-badia_san_pietro-complesso_esterno2.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Camaiore-badia_san_pietro-complesso_esterno3.jpg/1920px-Camaiore-badia_san_pietro-complesso_esterno3.jpg",
        "caption": "L'arco d'ingresso, unico resto delle mura",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-badia_san_pietro-complesso_esterno3.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Camaiore-badia_san_pietro-altare_maggiore.jpg/1920px-Camaiore-badia_san_pietro-altare_maggiore.jpg",
        "caption": "L'altare maggiore",
        "credit": {
          "author": "Davide Papalini",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-badia_san_pietro-altare_maggiore.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Camaiore-badia_san_pietro-complesso_esterno1.jpg/1920px-Camaiore-badia_san_pietro-complesso_esterno1.jpg",
    "imageCredit": {
      "author": "Davide Papalini",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Camaiore-badia_san_pietro-complesso_esterno1.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "pieve-di-santo-stefano": {
    "gallery": [
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Facciata_Pieve_di_Camaiore.jpg",
        "caption": "La facciata",
        "credit": {
          "author": "Vergaglia",
          "license": "Pubblico dominio",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Facciata_Pieve_di_Camaiore.jpg",
          "licenseUrl": null
        }
      },
      {
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Fonte_battesimale%2C_ricavato_da_un_sarcofago_del_II-III_secolo%2C_Pieve_di_Camaiore-edit.jpg/1920px-Fonte_battesimale%2C_ricavato_da_un_sarcofago_del_II-III_secolo%2C_Pieve_di_Camaiore-edit.jpg",
        "caption": "Il fonte battesimale, ricavato da un sarcofago romano",
        "credit": {
          "author": "Mongolo1984, edited by MenkinAlRire",
          "license": "CC BY-SA 3.0",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fonte_battesimale,_ricavato_da_un_sarcofago_del_II-III_secolo,_Pieve_di_Camaiore-edit.jpg",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
        }
      },
      {
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/78/Trittico_pieve_Camaiore_part..jpg",
        "caption": "Il trittico di Battista da Pisa, particolare",
        "credit": {
          "author": "Vergaglia",
          "license": "Pubblico dominio",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:Trittico_pieve_Camaiore_part..jpg",
          "licenseUrl": null
        }
      }
    ],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Pieve_di_Camaiore_%28esterno%29.JPG/1920px-Pieve_di_Camaiore_%28esterno%29.JPG",
    "imageCredit": {
      "author": "Mongolo1984",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pieve_di_Camaiore_(esterno).JPG",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  },
  "trekking-matanna-da-casoli": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Matanna_1.jpg/1920px-Matanna_1.jpg",
    "imageCredit": {
      "author": "Simone Dal Pino",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Matanna_1.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "trekking-gabberi-da-la-culla": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Croce_di_vetta_del_Monte_Gabberi_%2826-02-2019%29.jpg/1920px-Croce_di_vetta_del_Monte_Gabberi_%2826-02-2019%29.jpg",
    "imageCredit": {
      "author": "Franitto",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Croce_di_vetta_del_Monte_Gabberi_(26-02-2019).jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "trekking-gabberi-da-casoli": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Croce_di_vetta_del_Monte_Gabberi_%2826-02-2019%29.jpg/1920px-Croce_di_vetta_del_Monte_Gabberi_%2826-02-2019%29.jpg",
    "imageCredit": {
      "author": "Franitto",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Croce_di_vetta_del_Monte_Gabberi_(26-02-2019).jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "trekking-gabberi-da-santanna": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Croce_di_vetta_del_Monte_Gabberi_%2826-02-2019%29.jpg/1920px-Croce_di_vetta_del_Monte_Gabberi_%2826-02-2019%29.jpg",
    "imageCredit": {
      "author": "Franitto",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Croce_di_vetta_del_Monte_Gabberi_(26-02-2019).jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
    }
  },
  "tordelli-camaioresi": {
    "gallery": [],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Tordelli_al_rag%C3%B9.JPG",
    "imageCredit": {
      "author": "Autore sconosciuto",
      "license": "Pubblico dominio",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tordelli_al_rag%C3%B9.JPG",
      "licenseUrl": null
    }
  },
  "scarpaccia-camaiorese": {
    "gallery": [],
    "imageUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Scarpaccia.jpg/1920px-Scarpaccia.jpg",
    "imageCredit": {
      "author": "Snake990",
      "license": "Pubblico dominio",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scarpaccia.jpg",
      "licenseUrl": null
    }
  },
  "biroldo": {
    "gallery": [],
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/9/95/Biroldo_tagliato.jpg",
    "imageCredit": {
      "author": "Susanna Giaccai",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Biroldo_tagliato.jpg",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
    }
  }
}
