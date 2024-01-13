const getOverview = (req, res) => {
    res.status(200).render('overview', {
        title: 'All Tours',
    });
};

const getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'Tour',
    });
};
module.exports = { getOverview, getTour };
