import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native'
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, NavigationContainer } from '@react-navigation/native';

import styles from './insights.style';
import { COLORS, SIZES, FONT } from '../../../constants';
import InsightsCard from '../../common/cards/insights/InsightsCard';

import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../../../Firebase/firebase';


const Insights = ({uid}) => {
  const navigation = useNavigation();

  const [insightItems, setInsightItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const insightQuery = collection(db, `users/${uid}/insight`);
    onSnapshot(insightQuery, (snapshot) => {
      let insightList = [];
      snapshot.docs.map((doc) => insightList.push({...doc.data(), id: doc.id}))

    insightList.sort((a, b) => {
        const dateA = a.date ? formatDate(a.date) : null;
        const dateB = b.date ? formatDate(b.date) : null;
        return dateB - dateA;
    });

    setInsightItems(insightList);
    setLoading(false);
    }) 
  }, []);

  function formatDate(dateTimeString) {
    const [, datePart, timePart] = dateTimeString.match(/(\d+\/\d+\/\d+), (.+)/);
    const [month, day, year] = datePart.split('/').map(Number);
    const [time, meridiem] = timePart.split(' ');

    let [hours, minutes, seconds] = time.split(':').map(Number);

    if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
    } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
    }

    const formattedDate = new Date(year, month - 1, day, hours, minutes, seconds);

    return formattedDate.getTime();
  }
  
  const renderItem = ({item}) => {
    return(
        <InsightsCard date={item.date} insight={item.insight} prompt={item.prompt} id={item.id}/>
    );
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Insights</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
            <Ionicons name='chevron-forward' style={{color: COLORS.primary, fontSize: SIZES.xLarge}}/>
        </TouchableOpacity>
      </View>
      {insightItems.length > 0 ?
        <FlatList 
          nestedScrollEnabled={true}
          data={insightItems.slice(0,2)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        /> : 
        <View style={{padding: SIZES.medium}}>
          <Text
            style={{
              alignSelf: 'center',
              fontSize: SIZES.large,
              fontFamily: FONT.medium,
              fontWeight: '500',
              color: COLORS.secondary
          }}>No Insights Found</Text>
        </View>
      }
    </View>
  )
}

export default Insights