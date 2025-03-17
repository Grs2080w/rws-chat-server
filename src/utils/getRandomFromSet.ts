export default function getRandomFromSet<T>(set: Set<T>, id: string, size: number): T | undefined {
	let index: number = Math.floor(Math.random() * set.size)

	let value = Array.from(set)[index]
	if (value === id) {
		return getRandomFromSet(set, id, size)
	} else {
		return value
	}
}
