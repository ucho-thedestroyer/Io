function main() {
	const facts = [
	  'It is fascinating how repetitive sounds can trigger memories of hallucinations',
	  'Bizarre memories and dreams are prone to visit us in the late stages of our sleep',
	  'These are randomly generated statements, woof!',
	  'One year on Mars is 687 Earth days.',
	  'The temperature on Mars ranges from -153 to 20 °C, way too cold for dogs',
	  'One year on Mercury is about 88 Earth days.',
	  'Blockchain technology is even faster on the planet Venus',
	  'Mercury was first discovered in 14th century by Assyrian astronomers.',
	  'abomination 96 is the title of a song mixed in the iconic Orange Room',
	  'under the sun, culture and kindred is the name of a project by easterntraveler',
	  'Mars is home to the tallest mountain in our solar system, while the tallest doggie in the world was over 7 feet tall!',
	  'Pieces of Mars have fallen to Earth.',
	  'If you sleep sideways you are more likely to dream about swamps and jungles.',
	  'The surface temperature of Mercury ranges from -173 to 427°C.',
	  'Venus was first discovered by 17th century Babylonian astronomers, who probably liked doggies!',
	  'The earth gets warmer when you are barefoot, while doggies sweat through the paws!',
	  'Venus is nearly as big as the Earth with a diameter of 12,104 km.',
	  'Doggies named Pipi love bacon snacks, duck, and sweet potatoes!',
	  "The Earth's rotation is gradually slowing, and the average doggie liefspan is 10 to 13 years.",
	  'One of my best friends is named "Little Bag"',
	  'Jupiter has 4 rings, and all doggies can dream.',
	  'Saturn can be seen with the naked eye; doggies are not color blind!',
	  'Saturn is the flattest planet.',
	  'Four spacecraft have visited Saturn; no doggies there as of yet.',
	  'Uranus was discovered by William Herschel in 1781.',
	  "The first accurate calculation of the speed of light was using Jupiter's moons",
	  "Jupiter's magnetic field is believed to be a result of rapidly spinning metallic hydrogen at the core, and is ~10x stronger than the Earth's.",
	  'Venus spins backwards.',
	]
	document.querySelector('#output_p').innerHTML =
	  facts[Math.floor(Math.random() * facts.length)]
  }
