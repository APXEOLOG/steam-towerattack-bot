// ==UserScript==
// @name         SteamTowerAttackBot
// @namespace    http://apxeolog.com/
// @version      1.0
// @description  Simple bot for Tower Attack game
// @author       APXEOLOG
// @match        http://steamcommunity.com/minigame/towerattack/*
// @grant        none
// @run-at document-idle
// ==/UserScript==

var initId = setInterval(function() {
    if (CSceneGame !== undefined && CSceneGame.prototype.Tick !== undefined) {
        clearInterval(initId);
        var oldTickFunction = CSceneGame.prototype.Tick;
        CSceneGame.prototype.Tick = function() {
            CSceneGame.prototype.Tick = oldTickFunction;
            Init(this);
        }
    }
}, 1000);

function emulateClick(x, y, element) {
	var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("mousedown", true, true, window,
		0, x, y, x, y, false, false, false, false, 0, null);
    element.dispatchEvent(evt);
	evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("mouseup", true, true, window,
		0, x, y, x, y, false, false, false, false, 0, null);
    element.dispatchEvent(evt);
}

function getGoodLane(game, element) {
    for(var i = 0; i < game.m_rgGameData.lanes.length; i++) {
        if (isLaneDead(game.m_rgGameData.lanes[i])) continue;
        if (game.m_rgGameData.lanes[i].element === element) return i;
    }
    return -1;
}

function getAnyLane(game) {
    for(var i = 0; i < game.m_rgGameData.lanes.length; i++) {
        if (!isLaneDead(game.m_rgGameData.lanes[i])) return i;
    }
    return -1;
}

function findBestElement(game) {
    var tempArr = [ 
        { id: 3, dmg: game.m_rgPlayerTechTree.damage_multiplier_air },
        { id: 4, dmg: game.m_rgPlayerTechTree.damage_multiplier_earth },
        { id: 1, dmg: game.m_rgPlayerTechTree.damage_multiplier_fire },
        { id: 2, dmg: game.m_rgPlayerTechTree.damage_multiplier_water }];
    tempArr.sort(function(a, b) { return b.dmg - a.dmg });
    return tempArr[0].id;
}

function isLaneDead(lane) {
    var total = 0;
    for (var i = 0; i < lane.enemies.length; i++) {
        total += lane.enemies[i].hp;
    }
    return total === 0;
}

function Init(game) {   
    // Clicker
    setInterval(function() {
        emulateClick(630, 340, $J('#gamecontainer canvas')[0]);
    }, 50);
    // Game Update (2s interval seems to be ok here)
    setInterval(function() {
        // Change lane for better element
        var goodLane = getGoodLane(game, findBestElement(game));
        if (goodLane >= 0 && goodLane !== game.m_rgPlayerData.current_lane) {
            game.TryChangeLane(goodLane);
        } else if (goodLane === -1 && isLaneDead(game.m_rgGameData.lanes[game.m_rgPlayerData.current_lane])) {
			// Change for any lane if empty
            if (getAnyLane(game) >= 0)
                game.TryChangeLane(getAnyLane(game));
        }
        // Use heal pot if < 30% hp
        if (game.m_rgPlayerData.hp < game.m_rgPlayerTechTree.max_hp * 0.3) {
            $J('#ability_7 a').trigger('click');   
        }
        // Auto respawn
        RespawnPlayer();
    }, 2000);
}