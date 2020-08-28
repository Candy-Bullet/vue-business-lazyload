const express = require('express');
const app = express();
app.use(express.static(__dirname + '\\images'))
app.listen(3000);
const arr = [];
for (let i = 10; i <= 20; i++) {
    arr.push(`${i}.jpeg`)
}
app.get('/api/img', (req, res) => {
    res.json(arr)
})
