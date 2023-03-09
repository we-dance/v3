const { createSSRApp } = require("vue");
const { renderToString } = require("vue/server-renderer");
import mjml2html = require("mjml");
import * as fs from "fs";
import * as moment from "moment"; 
import { firestore } from "../firebase";
  

export async function renderEmail(type: string, data: any, customUtms = {}) {
  const template = fs.readFileSync(`./templates/${type}.mjml`, "utf8");

  const defaultUtms = {
    campaign: type,
    medium: "email",
    source: "newsletter",
  };

  const utm = {
    ...defaultUtms,
    ...customUtms,
  };

  const app = createSSRApp({
    data: () => {
      return data;
    },
    template,
    methods: {
      link(url: string, utmContent = "") {
        return (
          url +
          "?utm_campaign=" +
          utm.campaign +
          "&utm_medium=" +
          utm.medium +
          "&utm_source=" +
          utm.source +
          "&utm_content=" +
          utmContent
        );
      },
    },
  });

  app.config.compilerOptions.isCustomElement = (tag: any) =>
    tag.startsWith("mj");

  return mjml2html(await renderToString(app)).html;
}

export async function getWeeklyData(city: string) {
  const today = new Date().toISOString().slice(0, 10);
  const then = new Date();
  then.setDate(then.getDate() + 7);
  const sevenDaysFromNow = then.toISOString().slice(0, 10);
  const data = [];
  let profile: any = {};

  const profileDocs = (
    await firestore.collection("profiles").where("username", "==", city).get()
  ).docs;

  for (const doc of profileDocs) {
    profile = { id: doc.id, ...doc.data() };
  }
  
  let usernames = Object.keys(profile.watch?.list);

  for(let username of usernames) {
    const eventDocs = (
      await firestore
        .collection("posts")
        .where("startDate", ">", today)
        .where("startDate", "<", sevenDaysFromNow)
        .where("username", "==", username)
        .get()
    ).docs;

      for (const doc of eventDocs) {
        const event = {
          id: doc.id,
          ...doc.data(),
        } as any;
    
        data.push(event);
      }
  }
    
  const events: any = {
    intro:
      "Hope you had a great weekend and are ready with your dancing shoes on for a fantastic week ahead.",
    title: `${city} Dance Calendar`,
    links: {
      telegram: profile.telegram,
      instagram: profile.instagram,
      facebook: profile.facebook,
      addEvent: "https://wedance.vip/events/-/edit",
      city: `https://wedance.vip/${city}`,
    },
    days: data.map((event) => ({
      day: moment(event.startDate).format("dddd"), 
      date: moment(event.startDate).format("D MMM") ,
      events: [
        {
          title: event.name,
          organizer: event.org.name,
          venue: event.venue?.name,
          format: event.eventType,
          time: moment(event.startDate).format("hh:mm") ,
          link: event.link,
          cover: event.cover,
          styles: Object.keys(event.styles),
        }
      ]
    })),
  };

  return events;
}