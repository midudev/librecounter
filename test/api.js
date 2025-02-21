import {app} from './setup.js'
import {getDay} from '../lib/db/query.js'
import {site, userAgent} from './setup.js'

const path = '/mypage.fi'


async function testCounter() {
	await testCountPage(path)
	await testCountPage('/')
}

async function testCountPage(page) {
	const response = await app.inject({
		url: `/count?url=http://${site}${page}&userAgent=${userAgent}`,
		method: 'GET',
	})
	console.assert(response.statusCode == 200, 'could not count')
	const result = response.json()
	console.assert(result.ok, 'did not count')
}

async function testSiteStats() {
	const response = await app.inject({
		url: `/${site}/siteStats`,
		method: 'GET',
		headers: {'user-agent': 'testbot/1.0'},
	})
	console.assert(response.statusCode == 200, 'could not stats')
	const result = response.json()
	console.assert(result.byDay, 'has no days')
	console.assert(Array.isArray(result.byDay), 'byDay is not an array')
	const day = getDay()
	const found = result.byDay.filter(dayStats => dayStats.day == day)
	console.assert(found.length == 1, 'no data today')
	console.assert(found[0].value > 0, 'no value today')
	console.assert(result.byPage, 'has no pages')
	console.assert(result.byPage[path], 'has no path')
}

async function testLastDays() {
	const response = await app.inject({
		url: `/${site}/siteStats?days=1`,
		method: 'GET',
		headers: {'user-agent': 'testbot/1.0'},
	})
	console.assert(response.statusCode == 200, 'could not stats')
	const result = response.json()
	console.assert(result.byDay, 'has no days')
	console.assert(result.byDay.length == 1, 'should only have one day')
	const dayStats = result.byDay[0]
	const day = getDay()
	console.assert(dayStats.day == day, 'should only have today')
	console.assert(dayStats.value > 0, 'no value today')
}

async function testPageStats() {
	const response = await app.inject({
		url: `/${site}/pageStats?page=${path}`,
		method: 'GET',
		headers: {'user-agent': 'testbot/1.0'},
	})
	console.assert(response.statusCode == 200, 'could not get page stats')
	const result = response.json()
	console.assert(result.byDay, 'has no days')
	console.assert(!result.byPage, 'should have no page')
}

export default async function test() {
	await testCounter()
	await testSiteStats()
	await testPageStats()
	await testLastDays()
}

