const express = require('express');
const WebTorrent = require('webtorrent');

const app = express();
const port = 3000;
const client = new WebTorrent();

// Endpoint to stream the torrent
app.get('/stream', (req, res) => {
    
    const magnetURI = "magnet:?xt=urn:btih:c9e15763f722f23e98a29decdfae341b98d53056&dn=Cosmos+Laundromat&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fcosmos-laundromat.torrent";

    if (!magnetURI) {
        console.error('Magnet URI is required.');
        return res.status(400).send('Magnet URI is required.');
    }

    console.log(`Received magnet URI: ${magnetURI}`);

    // Logging information about the client
    console.log('Adding torrent...');

    // Add the torrent using the magnet URI
    client.add(magnetURI, (torrent) => {
        console.log(`Successfully added torrent with info hash: ${torrent.infoHash}`);

        // Assuming we want to stream the first file
        const file = torrent.files.find(file => file.name.endsWith('.mp4')); // You can adjust the file extension based on your needs.

        if (!file) {
            console.error('No suitable file found in the torrent.');
            return res.status(404).send('No suitable file found in the torrent.');
        }

        console.log(`Streaming file: ${file.name}`);

        // Setting response headers for video stream
        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes'
        });

        // Stream the file in chunks
        const stream = file.createReadStream();

        // Pipe the stream to the response
        stream.pipe(res);

        // Log when streaming starts
        stream.on('start', () => {
            console.log(`Streaming started for ${file.name}`);
        });

        // Handle stream errors
        stream.on('error', (err) => {
            console.error('Error while streaming:', err);
            res.status(500).send('Error streaming the file.');
        });

        // Log when the stream ends
        stream.on('end', () => {
            console.log(`Streaming finished for ${file.name}`);
            client.remove(torrent.infoHash); // Stop and remove the torrent after finishing
        });
    });

    // Handle errors if adding the torrent fails
    client.on('error', (err) => {
        console.error('Error adding the torrent:', err);
        res.status(500).send('Error adding the torrent.');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Torrent Streaming server running at http://localhost:${port}`);
});
