$(document).foundation();

// trigger updateMana on input change
var $form = $("form");
$form.find("input").on("keyup change", function() {
	updateMana();
});

$("#global-modifier").on("keyup change", function() {
	var modifier = parseFloat($(this).val());
	if (modifier) {
		GLOBALMODIFIER = modifier;
		updateMana();
	}
});

// define global constants
var DEBUG = false; // the modifier for tweaking the final outcomes
var GLOBALMODIFIER = 0.92; // the modifier for tweaking the final outcomes
var CARDCOUNTREF = 36; // the baseline number of cards to base the algorithm on
var MANACOUNTREF = 24; // the baseline number of mana cards
var MANACOSTPERCARDREF = 3; // the baseline mana cost per card average

function updateMana() {
	// This function calculates the recommended number of mana for your deck.
	// The algorithm is based on a recommended average mana cost per card of
	// between 2 and 4. For a 60 cards deck, if you have an average mana cost
	// per card of 3 then you should have 36 spells/creatures and 24 mana.
	// The math for this function is based on that balance.

	// set vars
	var totalCardCount = getTotalCards();
	var totalManaCost = getTotalManaCost();
	var totalColouredManaCost = getTotalColouredManaCost();
	var manaSplit = getManaSplit();
	var results = {};

	// crunch the numbers
	// calculate average mana per card
	var averageManaPerCard = (totalManaCost && totalCardCount) ? totalManaCost / totalCardCount : 0;
	// calculate card count modifier. this tells us if we're above or below the baseline amount
	var cardCountModifier = totalCardCount / CARDCOUNTREF;
	// calculate mana cost per card modifier. this tells us if we're above or below the baseline amount
	var manaCostModifier = averageManaPerCard / MANACOSTPERCARDREF;
	// calculate recommended mana count
	var suggestedTotalMana = MANACOUNTREF * cardCountModifier * manaCostModifier * GLOBALMODIFIER;	

	// for debugging
	log("------------ updateMana() ---------------")
	log("totalManaCost: " + totalManaCost);
	log("totalColouredManaCost: " + totalColouredManaCost);
	log("manaSplit: " + manaSplit);
	log("totalCardCount: " + totalCardCount);
	log("averageManaPerCard: " + averageManaPerCard);
	log("cardCountModifier: " + cardCountModifier);
	log("manaCostModifier: " + manaCostModifier);
	log("suggestedTotalMana: " + suggestedTotalMana);
	/**/	

	// Prepare the results for display
	results.totalMana = suggestedTotalMana.toFixed(1);
	results.avgCMC = averageManaPerCard.toFixed(2);

	// calculate and display the recommended mana per colour
	for (var key in manaSplit) {
		var colour = key;
		var cost = manaSplit[key];

		// only crunch and display the numbers if there is a cost greater than 1 and not colourless
		var manaColourTotal = cost / totalColouredManaCost * suggestedTotalMana;
		results["total" + ucFirst(colour)] = (manaColourTotal) ? manaColourTotal.toFixed(1) : 0;
	}

	updateResults(results);
}

// function to update the html with provided results
/* expects an associative array/object with one or more values:
{
	avgCMC : 3.0,
	totalMana : 22,
	totalBlue : 6,
	etc...	
}
*/
function updateResults(results) {
	log("------------ updateResults() ---------------");
	for (var key in results) {
		log("key: " + key + " | results: " + results[key] + " | #result-" + key);
		$form.find("#result-" + key).html(results[key]);
	}
}

// function gets the total mana cost
function getTotalManaCost() {
	var manaTotal = $form.find("#mana-total").val();
	manaTotal = (manaTotal) ? parseInt(manaTotal) : 0;
	return manaTotal;
}

// returns an int of the total number of coloured mana
function getTotalColouredManaCost() {
	var manaSplit = getManaSplit();
	var totalColouredMana = 0;
	for (var key in manaSplit) {
		totalColouredMana += manaSplit[key];
	}
	return totalColouredMana;
}

// returns an array of values for each colour
function getManaSplit() {
	var manaCost = [];
	$form.find("#mana-cost input").each(function() {
		var cost = $(this).val();
		cost = (cost) ? parseInt(cost) : 0;
		manaCost[$(this).attr("name")] = cost;
	});

	// return as either an int (total mana) or an array with separate values for each colour
	return manaCost;
}

// gets the total number of cards and spells and returns an int
function getTotalCards() {
	var totalCards = $form.find("#cards-total").val();
	totalCards = (totalCards) ? parseInt(totalCards) : 0;
	return totalCards;
}

// helper function: capitalize the first letter of a string
function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// helper function: output to the console if debug enabled
function log(data) {
	if (DEBUG) {
		console.log(data);
	}
}