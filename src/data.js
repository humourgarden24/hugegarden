// Museum content. `viewerId` links each monument to its timeline entry in ./viewer/monumentsData.js.
// Hotspots drive the museum model page; the timeline viewer has its own POIs in ./viewer/monuments/.
export const monuments = [
  {
    id:'taj',
    viewerId:'taj',
    name:'Taj Mahal',
    location:'Agra, Uttar Pradesh',
    era:'Mughal architecture',
    period:'1632–1653',
    source:'https://whc.unesco.org/en/list/252/',
    summary:'Commissioned by Shah Jahan in memory of Mumtaz Mahal, this white-marble mausoleum stands in Agra beside the Yamuna.',
    hotspots:[
      {id:'dome', title:'The central dome', position:[0,5.5,0], text:'A large dome crowns the mausoleum. Notice how the smaller domed pavilions balance the central form. The model simplifies the building’s proportions.'},
      {id:'minaret', title:'Four minarets', position:[3.7,3.8,3.7], text:'Four minarets stand at the corners of the raised platform. Orbit the model and compare their placement around the central mausoleum.'},
      {id:'garden', title:'Garden and symmetry', position:[-2,0.35,7], text:'The formal garden uses intersecting paths and water features. Compare the left and right sides to see the role of symmetry in the overall design.'}
    ],
    timeline:[
      ['1632','Construction began under Shah Jahan.'],
      ['1648','The mausoleum was completed.'],
      ['1653','The mosque, guest house, main gateway and outer courtyard were finished, completing the complex.'],
      ['1983','Inscribed on the UNESCO World Heritage List.']
    ],
    quiz:[
      {question:'Who commissioned the Taj Mahal?', options:['Shah Jahan','Ashoka','Akbar'], answer:0, why:'Shah Jahan commissioned it in memory of Mumtaz Mahal.'},
      {question:'Where are the four minarets positioned?', options:['Inside the dome','At the corners of the platform','In the centre of the garden'], answer:1, why:'The minarets frame the mausoleum at the platform’s corners.'},
      {question:'Which river flows behind the Taj Mahal?', options:['Yamuna','Ganga','Narmada'], answer:0, why:'The tomb stands on the bank of the Yamuna at Agra.'},
      {question:'What is the four-part garden plan of the Taj complex called?', options:['Stepwell','Courtyard maze','Charbagh'], answer:2, why:'The charbagh divides the garden into four quarters with water channels and paths.'},
      {question:'When was the mausoleum itself completed?', options:['1632','1648','1707'], answer:1, why:'The mausoleum was finished in 1648; the rest of the complex followed by 1653.'},
      {question:'Which red sandstone building stands on the west side of the tomb?', options:['A palace','A mosque','A lighthouse'], answer:1, why:'A mosque stands to the west, balanced by the identical jawab on the east.'}
    ]
  },
  {
    id:'qutub',
    viewerId:'qutub',
    name:'Qutub Minar',
    location:'Delhi',
    era:'Delhi Sultanate',
    period:'c. 1199 – 1368',
    source:'https://whc.unesco.org/en/list/233/',
    summary:'The Qutb complex contains a tall tapering minaret and monuments from the early Delhi Sultanate.',
    hotspots:[
      {id:'tower', title:'A tapering tower', position:[0.8,6,0], text:'The tower narrows as it rises. Move around the model to examine its vertical form.'},
      {id:'balcony', title:'Projecting balconies', position:[1.15,3.5,0], text:'Balconies mark the storeys. They divide the tall structure into distinct visual sections.'},
      {id:'base', title:'The surrounding complex', position:[-2,0.4,2], text:'The minaret belongs to a larger historic complex. This first model shows only a simplified tower and platform.'}
    ],
    timeline:[
      ['c. 1199','Qutb ud-Din Aibak began the tower and completed its first storey.'],
      ['1211–1236','Iltutmish added the second, third and fourth storeys.'],
      ['1326 & 1368','Lightning damaged the fourth storey. Firuz Shah Tughlaq replaced it with two storeys, giving the tower five storeys and a height of 72.5 m.'],
      ['1993','The Qutb complex entered the UNESCO World Heritage List.']
    ],
    quiz:[
      {question:'Which city contains the Qutb complex?', options:['Agra','Jaipur','Delhi'], answer:2, why:'The Qutb complex is in Delhi.'},
      {question:'How does the tower’s width change upward?', options:['It narrows','It gets wider','It stays square'], answer:0, why:'The minaret tapers as it rises.'},
      {question:'Who began building the tower around 1199?', options:['Akbar','Shah Jahan','Qutb ud-Din Aibak'], answer:2, why:'Qutb ud-Din Aibak began the tower and completed only its first storey.'},
      {question:'How many storeys does the tower have today?', options:['Three','Five','Seven'], answer:1, why:'Firuz Shah Tughlaq replaced the damaged fourth storey with two, giving five.'},
      {question:'Who replaced the lightning-damaged fourth storey with two new ones?', options:['Firuz Shah Tughlaq','Iltutmish','Shah Jahan'], answer:0, why:'Firuz Shah Tughlaq rebuilt the upper storeys after the 1368 lightning damage.'},
      {question:'Which ancient metal monument stands in the courtyard of the neighbouring mosque?', options:['A bronze bell','The Iron Pillar','A copper dome'], answer:1, why:'The Iron Pillar, carrying a fourth-century inscription, stands in the Quwwat-ul-Islam courtyard.'}
    ]
  },
  {
    id:'fort',
    viewerId:'fort',
    name:'Red Fort',
    location:'Delhi',
    era:'Mughal architecture',
    period:'1639–1648',
    source:'https://whc.unesco.org/en/list/231/',
    summary:'Built as the palace fort of Shahjahanabad under Shah Jahan, the Red Fort combines defensive walls with palace spaces.',
    hotspots:[
      {id:'gate', title:'A monumental entrance', position:[0,3,3.25], text:'An imposing gateway introduces the palace fort. Compare the scale of the entrance with the enclosing walls in this simplified model.'},
      {id:'walls', title:'Red sandstone walls', position:[-4,1.8,3], text:'The massive red sandstone walls give the fort its name and define its outer boundary.'},
      {id:'palace', title:'Palace pavilions', position:[0,2,-1], text:'Inside the fort, palace pavilions were connected by a water channel called Nahr-i-Behisht, the Stream of Paradise.'}
    ],
    timeline:[
      ['1639','Shah Jahan laid the foundation of the palace fort, after moving his capital to Delhi in 1638.'],
      ['1648','The fort was completed.'],
      ['After 1857','British military occupation altered parts of the complex.'],
      ['1947','In August 1947 the Indian flag was raised above the Lahori Gate, and Independence Day is still celebrated here.'],
      ['2007','The Red Fort Complex entered the UNESCO World Heritage List.']
    ],
    quiz:[
      {question:'Which material gives the fort its name?', options:['White marble','Red sandstone','Blue tile'], answer:1, why:'The enclosing red sandstone walls give the Red Fort its name.'},
      {question:'The Red Fort was built as…', options:['A lighthouse','A stepwell','A palace fort'], answer:2, why:'It was the palace fort of Shahjahanabad.'},
      {question:'Which emperor built the Red Fort?', options:['Shah Jahan','Aurangzeb','Akbar'], answer:0, why:'Shah Jahan built it after moving his capital to Delhi.'},
      {question:'Which gate was the main entrance, on the west side facing Chandni Chowk?', options:['Delhi Gate','Lahori Gate','Ajmeri Gate'], answer:1, why:'The Lahori Gate is the main entrance; the Delhi Gate on the south was the second public gate.'},
      {question:'What was the Nahr-i-Bihisht?', options:['A royal throne','A defensive moat','A water channel called the Stream of Paradise'], answer:2, why:'It was the channel that ran through the palace pavilions.'},
      {question:'Which covered market leads from the Lahori Gate towards the drum house?', options:['Khari Baoli','Chhatta Chowk','Sadar Bazaar'], answer:1, why:'The Lahori Gate opens into the vaulted Chhatta Chowk, which leads to the Naubat Khana.'}
    ]
  }
];
