import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const CHURCH_ID = 'lakeland-fellowship';

export function listenToAll(callback) {
  return onSnapshot(doc(db, 'churches', CHURCH_ID), function(snap) {
    if (snap.exists()) {
      var data = snap.data();
      callback({
        events:         data.events         || [],
        participants:   data.participants    || [],
        groups:         data.groups         || [],
        shuffleHistory: data.shuffleHistory || [],
      });
    } else {
      callback({ events: [], participants: [], groups: [], shuffleHistory: [] });
    }
  });
}

function saveField(field, value) {
  var update = {};
  update[field] = value;
  return setDoc(doc(db, 'churches', CHURCH_ID), update, { merge: true });
}

export function saveEvents(events)             { return saveField('events', events); }
export function saveParticipants(participants) { return saveField('participants', participants); }
export function saveGroups(groups)             { return saveField('groups', groups); }
export function saveShuffleHistory(history)    { return saveField('shuffleHistory', history); }

export function saveAll(data) {
  return setDoc(doc(db, 'churches', CHURCH_ID), data, { merge: true });
}
