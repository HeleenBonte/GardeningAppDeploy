import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getItem } from '../auth/storage';
import { getUserFavoriteCrops, addFavoriteCrop, removeFavoriteCrop } from '../config/api';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';

import useCrops from '../hooks/useCrops';
import { filterCrop, Month, isMonthInRange } from '../lib/cropFilters';

export default function CropScreen() {
    const navigation = useNavigation();
	const { theme } = useTheme();
	const [search, setSearch] = useState('');
	const { crops, recipes, loading, error, reload } = useCrops();
	const isFocused = useIsFocused();

	useEffect(() => {
		if (isFocused) reload();
	}, [isFocused, reload]);

	const [favoritesIds, setFavoritesIds] = useState(new Set());
	const [favLoadingIds, setFavLoadingIds] = useState(new Set());

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const userId = await getItem('user_id');
				if (!userId) return;
				const res = await getUserFavoriteCrops(userId);
				const ids = Array.isArray(res) ? res.map(r => r.id) : (res?.map ? res.map(r => r.id) : []);
				if (mounted) setFavoritesIds(new Set(ids));
			} catch (err) {
				console.warn('Failed to load favorite crops', err);
			}
		})();
		return () => { mounted = false; };
	}, [isFocused]);

	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await reload();
		} finally {
			setRefreshing(false);
		}
	};
	const [openFilter, setOpenFilter] = useState(null);
	const [selectedHarvestMonth, setSelectedHarvestMonth] = useState(null);
	const [selectedSowingMonth, setSelectedSowingMonth] = useState(null);
	const [selectedLocations, setSelectedLocations] = useState({});
	const locationOptions = [
		{ key: 'inPots', label: 'In Pots' },
		{ key: 'inGreenhouse', label: 'In Greenhouse' },
		{ key: 'inHouse', label: 'In House' },
		{ key: 'inGarden', label: 'In Garden' },
	];

	const filters = [
		'Sowing/Planting Period',
		'Harvest Period',
		'Growing Location',
	];

	const months = Object.values(Month);

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: theme.background }]}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					colors={[theme.primary]}
					tintColor={theme.primary}
				/>
			}
		>
			<AppHeader />
			<View style={styles.titleSection}>
				<Text style={[styles.titleText, { color: theme.text }]}>Garden Crops</Text>
				<Text style={[styles.subtitle, { color: theme.secondaryText }]}>Explore our collection of crops with detailed growing guides</Text>

				<View style={styles.searchWrapper}>
					<TextInput
						placeholder="Search crops..."
						placeholderTextColor={theme.secondaryText}
						value={search}
						onChangeText={setSearch}
						style={[styles.searchInput, { backgroundColor: theme.cardBackground, color: theme.text, borderColor: theme.cardBorder }]}
					/>
				</View>

				<View style={[styles.filtersContainer, { borderColor: theme.cardBorder, backgroundColor: theme.cardBackground }]}> 
					{filters.map((label, idx) => (
						<React.Fragment key={label}>
							<TouchableOpacity
								key={label}
								style={styles.filterRow}
								onPress={() => setOpenFilter(openFilter === idx ? null : idx)}
							>
								<Text style={[styles.filterLabel, { color: theme.text }]}>{label}</Text>
								<Ionicons name={openFilter === idx ? 'chevron-up' : 'chevron-down'} size={18} color={theme.secondaryText} />
							</TouchableOpacity>
							{/* month picker for the first filter (Sowing/Planting Period) */}
							{idx === 0 && openFilter === idx && (
								<View style={styles.monthsWrapper}>
									{months.map((m) => {
										const selected = selectedSowingMonth === m;
										return (
											<TouchableOpacity
												key={m}
												style={[styles.monthItem, selected && { borderColor: theme.primary, backgroundColor: theme.activeTabBg }]}
												onPress={() => setSelectedSowingMonth(selected ? null : m)}
											>
												<Text style={{ color: selected ? theme.primary : theme.text }}>{m.substring(0,3)}</Text>
											</TouchableOpacity>
										);
									})}
									<TouchableOpacity onPress={() => setSelectedSowingMonth(null)} style={styles.clearButton}>
										<Text style={{ color: theme.primary }}>Clear</Text>
									</TouchableOpacity>
								</View>
						)}

						{/* harvest month picker for the second filter */}
						{idx === 1 && openFilter === idx && (
							<View style={styles.monthsWrapper}>
								{months.map((m) => {
									const selected = selectedHarvestMonth === m;
									return (
										<TouchableOpacity
											key={m + '-harv'}
											style={[styles.monthItem, selected && { borderColor: theme.primary, backgroundColor: theme.activeTabBg }]}
											onPress={() => setSelectedHarvestMonth(selected ? null : m)}
										>
											<Text style={{ color: selected ? theme.primary : theme.text }}>{m.substring(0,3)}</Text>
										</TouchableOpacity>
									);
								})}
								<TouchableOpacity onPress={() => setSelectedHarvestMonth(null)} style={styles.clearButton}>
									<Text style={{ color: theme.primary }}>Clear</Text>
								</TouchableOpacity>
							</View>
						)}

						{/* growing location multi-select for the third filter */}
						{idx === 2 && openFilter === idx && (
							<View style={styles.monthsWrapper}>
								{locationOptions.map((opt) => {
									const selected = !!selectedLocations[opt.key];
									return (
										<TouchableOpacity
											key={opt.key}
											style={[styles.monthItem, selected && { borderColor: theme.primary, backgroundColor: theme.activeTabBg }]}
											onPress={() => setSelectedLocations((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))}
										>
											<Text style={{ color: selected ? theme.primary : theme.text }}>{opt.label}</Text>
										</TouchableOpacity>
									);
								})}
								<TouchableOpacity onPress={() => setSelectedLocations({})} style={styles.clearButton}>
									<Text style={{ color: theme.primary }}>Clear</Text>
								</TouchableOpacity>
							</View>
						)}
						</React.Fragment>
					))}
				</View>
			</View>

			{error && (
				<View style={{ padding: 16 }}>
					<Text style={{ color: theme.error || 'red' }}>Failed to load crops: {String(error)}</Text>
				</View>
			)}

			{loading && (
				<View style={{ padding: 16 }}>
					<Text style={{ color: theme.secondaryText }}>Loading...</Text>
				</View>
			)}

			{crops
				.filter(crop => filterCrop(crop, {
					search,
					selectedSowingMonth,
					selectedHarvestMonth,
					selectedLocations
				}))
				.map((crop) => {
					const isFav = favoritesIds.has(crop.id);
					return (
						<View key={crop.id} style={[styles.card, { borderColor: theme.cardBorder, backgroundColor: theme.cardBackground }]}>
							<Image source={{ uri: crop.image }} style={styles.image} />
							<View style={styles.cardContent}>
								<Text style={[styles.cardTitle, { color: theme.text }]}>{crop.name || crop.title}</Text>
								<Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>{crop.subtitle || crop.cropDescription}</Text>
								<TouchableOpacity
									style={[styles.button, { backgroundColor: theme.primary }]}
									onPress={() => {
										const relatedRecipes = recipes.filter(r => String(r.cropId) === String(crop.id));
										navigation.navigate('CropDetail', { crop, relatedRecipes });
									}}
								>
									<Text style={styles.buttonText}>View Details</Text>
								</TouchableOpacity>
							</View>
							<TouchableOpacity
								style={[styles.heartButton, { backgroundColor: '#2b2b2b' }]}
									onPress={async () => {
									const userId = await getItem('user_id');
									if (!userId) return;
									const cropId = crop.id;
									setFavLoadingIds(prev => new Set(prev).add(cropId));
									try {
										if (isFav) {
											await removeFavoriteCrop(userId, cropId);
											setFavoritesIds(prev => {
												const copy = new Set(prev);
												copy.delete(cropId);
												return copy;
											});
										} else {
											await addFavoriteCrop(userId, cropId);
											setFavoritesIds(prev => new Set(prev).add(cropId));
										}
									} catch (err) {
										console.warn('Failed to toggle favorite crop', err);
									} finally {
										setFavLoadingIds(prev => {
											const copy = new Set(prev);
											copy.delete(cropId);
											return copy;
										});
									}
								}}
								disabled={favLoadingIds.has(crop.id)}
							>
								<Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#ff6b35' : theme.secondaryText} />
							</TouchableOpacity>
						</View>
					);
				})}

		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
      titleSection: {
    padding: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
	appBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	appBarLeft: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	appLogo: {
		width: 34,
		height: 34,
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 8,
	},
	appName: {
		fontSize: 14,
		fontWeight: '600',
	},
	searchWrapper: {
		marginTop: 12,
	},
	searchInput: {
		height: 42,
		borderRadius: 10,
		paddingHorizontal: 12,
		borderWidth: 1,
	},
	filtersContainer: {
		marginTop: 12,
		marginHorizontal: -4,
		borderRadius: 8,
		overflow: 'hidden',
	},
	filterRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
	},
	filterLabel: {
		fontSize: 14,
	},
	monthsWrapper: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: 8,
		gap: 6,
		alignItems: 'center',
	},
	monthItem: {
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderRadius: 6,
		borderWidth: 1,
		marginRight: 6,
	},
	clearButton: {
		marginLeft: 8,
		paddingHorizontal: 8,
		paddingVertical: 6,
	},
	card: {
		marginHorizontal: 16,
		marginBottom: 16,
		borderRadius: 8,
		overflow: 'hidden',
		borderWidth: 1,
	},
	heartButton: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
	image: {
		width: '100%',
		height: 180,
	},
	cardContent: {
		padding: 12,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '600',
	},
	cardSubtitle: {
		marginTop: 6,
		fontSize: 13,
		marginBottom: 10,
	},
	button: {
		alignSelf: 'flex-start',
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 6,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
	},
});
