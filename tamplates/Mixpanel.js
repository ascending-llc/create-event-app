import mixpanel from 'mixpanel-browser';

export const Mixpanel = {
  identify: (id) => {
    mixpanel.identify(id);
  },
  alias: (id) => {
    mixpanel.alias(id);
  },
  track: (name, props) => {
    mixpanel.track(name, props);
  },
  people: {
    set: (props) => {
      mixpanel.people.set(props);
    },
  },
  time_event: (name) => {
    mixpanel.time_event(name);
  },
  track_links: (query, name) => {
    mixpanel.track_links(query, name);
  },
  register: (obj) => {
    mixpanel.register(obj);
  },
  unregister: (str) => {
    mixpanel.unregister(str);
  },
  register_once: (obj) => {
    mixpanel.register_once(obj);
  },
};

function getMixpanel() {
  return Mixpanel;
}

export default getMixpanel;
