import { analytics } from '@/utils/analytics';
import { getDate } from '@/utils';

import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const AnalyticsPage = async () => {
	const TRACKING_DAYS = 7;
	const pageviews = await analytics.retrieveDays('pageview', TRACKING_DAYS);

	const totalPageviews = pageviews.reduce((acc, curr) => {
		return (
			acc +
			curr.events.reduce((acc, curr) => {
				return acc + Object.values(curr)[0]!;
			}, 0)
		);
	}, 0);

	const avgVisitorsPerDay = (totalPageviews / TRACKING_DAYS).toFixed(1);

	const amtVisitorsToday = pageviews
		.filter((ev) => ev.date === getDate())
		.reduce((acc, curr) => {
			return (
				acc +
				curr.events.reduce((acc, curr) => acc + Object.values(curr)[0]!, 0)
			);
		}, 0);

	const topCountriesMap = new Map<string, number>();

	for (let i = 0; i < pageviews.length; i++) {
		const day = pageviews[i];

		if (!day) continue;

		for (let j = 0; j < pageviews.length; j++) {
			const event = day.events[j];

			if (!event) continue;

			const key = Object.keys(event)[0]!;
			const value = Object.values(event)[0]!;

			const parseKey = JSON.parse(key);
			const country = parseKey?.country;

			if (country) {
				if (topCountriesMap.has(country)) {
					const prevValue = topCountriesMap.get(country)!;
					topCountriesMap.set(country, prevValue + value);
				} else {
					topCountriesMap.set(country, value);
				}
			}
		}
	}

	const topCountries = [...topCountriesMap.entries()]
		.sort((a, b) => {
			if (a[1] > b[1]) return -1;
			else return 1;
		})
		.slice(0, 5);

	return (
		<div className='min-h-screen w-full py-12 flex justify-center'>
			<div className='relative w-full max-w-6xl mx-auto text-white'>
				<AnalyticsDashboard
					avgVisitorsPerDay={avgVisitorsPerDay}
					amtVisitorsToday={amtVisitorsToday}
					timeseriesPageviews={pageviews}
					topCountries={topCountries}
				/>
			</div>
		</div>
	);
};

export default AnalyticsPage;
