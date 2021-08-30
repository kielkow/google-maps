const fs = require('fs');
const axios = require('axios');
const json2xls = require('json2xls');

const args = process.argv.slice(2);
const key = args[0];
const address = args[1];
const radius = args[2];
const type = args[3];

searchPlaces(key, address, radius, type);

async function searchPlaces(key, address, radius, type) {
    try {
        const location = address.split(" ").join("+");

        const geolocationResponse = await axios({
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${key}`,
            headers: {}
        });

        const coordinates = `${geolocationResponse.data.results[0].geometry.location.lat}, ${geolocationResponse.data.results[0].geometry.location.lng}`;

        const nearbySearchResponse = await axios({
            method: 'get',
            url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${key}&location=${coordinates}&radius=${radius}&type=${type}`,
            headers: {}
        });

        const { results } = nearbySearchResponse.data;

        let places = [];

        for (const result of results) {
            const placeDetailsResponse = await axios({
                method: 'get',
                url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&key=${key}`,
                headers: {}
            });

            const {
                name,
                formatted_address,
                formatted_phone_number,
                rating,
                website
            } = placeDetailsResponse.data.result;

            places.push({
                name,
                address: formatted_address,
                phone_number: formatted_phone_number,
                rating,
                website,
            })
        }

        const xls = json2xls(places);
        fs.writeFileSync('places.xlsx', xls, 'binary', (err) => {
            if (err) {
                console.log("writeFileSync :", err);
            }
        });
    } catch (error) {
        console.log(error)
    }
}
